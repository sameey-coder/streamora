import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readStore, writeStore, resetStore } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_ENV_PATH = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: ROOT_ENV_PATH });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_RESET_TOKEN = process.env.ADMIN_RESET_TOKEN;
const hasFlwSecretKey = Boolean(FLW_SECRET_KEY && FLW_SECRET_KEY.trim());
const hasAdminResetToken = Boolean(ADMIN_RESET_TOKEN && ADMIN_RESET_TOKEN.trim());

const PLANS = {
  standard: { id: 'standard', name: 'STANDARD', amount: 4500, price: '₦4,500/month', billing: 'Monthly' },
  premium: { id: 'premium', name: 'PREMIUM', amount: 7000, price: '₦7,000/month', billing: 'Monthly' },
};

function getPlan(planId) { return PLANS[planId] || null; }
function nowIso() { return new Date().toISOString(); }
function normalizeStatus(value) { return typeof value === 'string' ? value.trim().toLowerCase() : ''; }
function isCancelledStatus(status) { return ['cancelled', 'canceled', 'cancel'].includes(normalizeStatus(status)); }
function isFailedStatus(status) { return ['failed', 'declined', 'error', 'abandoned'].includes(normalizeStatus(status)); }

function getFlutterwaveErrorMessage(error) {
  const flwMessage = error.response?.data?.message;
  if (typeof flwMessage === 'string' && flwMessage.trim()) return flwMessage.trim();
  if (error.response?.status) return `Flutterwave request failed with status ${error.response.status}`;
  return 'Unable to reach Flutterwave. Please try again.';
}

function getRequestAdminResetToken(req) {
  const headerToken = req.get('x-streamora-admin-token');
  if (typeof headerToken === 'string' && headerToken.trim()) return headerToken.trim();
  const bodyToken = req.body?.adminToken;
  if (typeof bodyToken === 'string' && bodyToken.trim()) return bodyToken.trim();
  return '';
}

function requireAdminResetAuth(req, res, next) {
  // Demo-only protection: no real user/session auth backend. A server-side env
  // token prevents unauthenticated/random resets, but is NOT production-grade
  // admin authorization (no identity, RBAC, CSRF protection, audit, rotation).
  if (!hasAdminResetToken) {
    return res.status(503).json({ error: 'Admin reset is not configured. Set ADMIN_RESET_TOKEN in the server environment.' });
  }
  const providedToken = getRequestAdminResetToken(req);
  if (!providedToken || providedToken !== ADMIN_RESET_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized admin reset request.' });
  }
  return next();
}

function paymentPublicRecord(payment) {
  if (!payment) return null;
  return {
    tx_ref: payment.tx_ref, transaction_id: payment.transaction_id ?? null, userId: payment.userId,
    planId: payment.planId, planName: payment.planName, amount: payment.amount, currency: payment.currency,
    status: payment.status, verified: Boolean(payment.verified), createdAt: payment.createdAt,
    updatedAt: payment.updatedAt, verifiedAt: payment.verifiedAt ?? null, customer: payment.customer ?? null,
  };
}

function subscriptionPublicRecord(sub) {
  if (!sub || sub.status !== 'active' || !sub.verifiedAt) return null;
  return {
    userId: sub.userId, planId: sub.planId, planName: sub.planName, price: sub.price, billing: sub.billing,
    amount: sub.amount, currency: sub.currency, status: 'active', tx_ref: sub.tx_ref,
    transaction_id: sub.transaction_id ?? null, verifiedAt: sub.verifiedAt, updatedAt: sub.updatedAt ?? sub.verifiedAt,
  };
}

function findPayment(store, { tx_ref, transaction_id }) {
  if (transaction_id) {
    const byTxId = store.payments.find((p) => String(p.transaction_id) === String(transaction_id));
    if (byTxId) return byTxId;
  }
  if (tx_ref) return store.payments.find((p) => p.tx_ref === tx_ref) || null;
  return null;
}

function upsertPayment(store, patch) {
  const idx = store.payments.findIndex((p) => p.tx_ref === patch.tx_ref);
  if (idx === -1) { store.payments.push(patch); return patch; }
  store.payments[idx] = { ...store.payments[idx], ...patch, updatedAt: patch.updatedAt || nowIso() };
  return store.payments[idx];
}

function clearActiveSubscriptionForUser(store, userId, reason, tx_ref) {
  const current = store.subscriptionsByUser[userId];
  if (!current) return;
  store.subscriptionsByUser[userId] = { ...current, status: 'inactive', deactivatedAt: nowIso(), deactivationReason: reason, deactivatedTxRef: tx_ref || current.tx_ref };
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/payments/plans', (req, res) => res.json({ plans: Object.values(PLANS) }));

app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { planId, email, name, userId } = req.body || {};
    if (!hasFlwSecretKey) return res.status(500).json({ error: 'Server not configured: FLW_SECRET_KEY missing' });
    if (!planId || !email || !userId) return res.status(400).json({ error: 'Missing required fields: planId, email, userId' });
    const plan = getPlan(planId);
    if (!plan) return res.status(400).json({ error: 'Invalid plan. Only standard and premium are available.' });
    const tx_ref = 'streamora_' + String(userId) + '_' + Date.now() + '_' + uuidv4().slice(0, 8);
    const redirect_url = FRONTEND_URL + '/payment/success';
    const paymentData = {
      tx_ref, amount: plan.amount, currency: 'NGN', redirect_url,
      customer: { email, name: name || email },
      customizations: { title: 'STREAMORA', description: 'Subscription - ' + plan.name },
      meta: { userId: String(userId), planId: plan.id, planName: plan.name, expectedAmount: plan.amount, expectedCurrency: 'NGN' },
    };
    const flwResponse = await axios.post('https://api.flutterwave.com/v3/payments', paymentData, {
      headers: { Authorization: 'Bearer ' + FLW_SECRET_KEY, 'Content-Type': 'application/json' }, timeout: 20000,
    });
    const flwData = flwResponse.data;
    const checkoutUrl = flwData?.data?.link;
    if (flwData?.status !== 'success' || typeof checkoutUrl !== 'string' || !checkoutUrl) {
      const message = typeof flwData?.message === 'string' && flwData.message.trim() ? flwData.message.trim() : 'Flutterwave rejected the payment request';
      return res.status(502).json({ error: message });
    }
    const store = readStore();
    upsertPayment(store, {
      tx_ref, transaction_id: null, userId: String(userId), planId: plan.id, planName: plan.name, amount: plan.amount,
      currency: 'NGN', status: 'initiated', verified: false, createdAt: nowIso(), updatedAt: nowIso(), customer: { email, name: name || email },
    });
    writeStore(store);
    return res.json({ success: true, tx_ref, checkoutUrl, amount: plan.amount, currency: 'NGN', planId: plan.id });
  } catch (error) {
    return res.status(502).json({ error: getFlutterwaveErrorMessage(error) });
  }
});

async function verifyWithFlutterwave({ tx_ref, transaction_id }) {
  const headers = { Authorization: 'Bearer ' + FLW_SECRET_KEY, 'Content-Type': 'application/json' };
  let response;
  if (transaction_id) {
    response = await axios.get('https://api.flutterwave.com/v3/transactions/' + encodeURIComponent(String(transaction_id)) + '/verify', { headers, timeout: 20000 });
  } else {
    response = await axios.get('https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=' + encodeURIComponent(tx_ref), { headers, timeout: 20000 });
  }
  return response?.data;
}

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { tx_ref, transaction_id } = req.body || {};
    if (!hasFlwSecretKey) return res.status(500).json({ error: 'Server not configured: FLW_SECRET_KEY missing' });
    if (!tx_ref && !transaction_id) return res.status(400).json({ error: 'tx_ref or transaction_id is required' });
    const store = readStore();
    const existing = findPayment(store, { tx_ref, transaction_id });
    if (existing?.verified && existing.status === 'successful') {
      const sub = store.subscriptionsByUser[existing.userId];
      return res.status(200).json({ verified: true, status: 'successful', alreadyProcessed: true, tx_ref: existing.tx_ref, transaction_id: existing.transaction_id, amount: existing.amount, currency: existing.currency, planId: existing.planId, planName: existing.planName, subscription: subscriptionPublicRecord(sub) });
    }
    let flwPayload;
    try { flwPayload = await verifyWithFlutterwave({ tx_ref, transaction_id }); }
    catch (error) { return res.status(502).json({ verified: false, error: getFlutterwaveErrorMessage(error) }); }
    const data = flwPayload?.data || {};
    const flwStatus = normalizeStatus(data.status || flwPayload?.status);
    const resolvedTxRef = data.tx_ref || tx_ref || existing?.tx_ref;
    const resolvedTxId = data.id ?? transaction_id ?? existing?.transaction_id ?? null;
    const meta = data.meta || {};
    const planId = meta.planId || existing?.planId;
    const plan = getPlan(planId);
    const expectedAmount = plan?.amount ?? existing?.amount;
    const amount = Number(data.amount);
    const currency = String(data.currency || '').toUpperCase();
    const chargedAmount = Number(data.charged_amount ?? data.amount);
    const baseRecord = { tx_ref: resolvedTxRef, transaction_id: resolvedTxId, userId: String(meta.userId || existing?.userId || ''), planId: plan?.id || planId || existing?.planId || null, planName: plan?.name || meta.planName || existing?.planName || null, amount: Number.isFinite(amount) ? amount : existing?.amount ?? null, currency: currency || existing?.currency || null, createdAt: existing?.createdAt || nowIso(), updatedAt: nowIso(), customer: data.customer || existing?.customer || null, flwStatus: data.status || flwPayload?.status || null };
    if (isCancelledStatus(flwStatus)) {
      upsertPayment(store, { ...baseRecord, status: 'cancelled', verified: false, verifiedAt: null });
      if (baseRecord.userId) clearActiveSubscriptionForUser(store, baseRecord.userId, 'cancelled', resolvedTxRef);
      writeStore(store);
      return res.status(200).json({ verified: false, status: 'cancelled', tx_ref: resolvedTxRef, transaction_id: resolvedTxId, message: 'Payment was cancelled. No subscription was activated.' });
    }
    if (isFailedStatus(flwStatus)) {
      upsertPayment(store, { ...baseRecord, status: 'failed', verified: false, verifiedAt: null });
      writeStore(store);
      return res.status(200).json({ verified: false, status: 'failed', tx_ref: resolvedTxRef, transaction_id: resolvedTxId, message: 'Payment failed. No subscription was activated.' });
    }
    const amountMatches = plan ? amount === plan.amount : Number.isFinite(amount) && amount === Number(expectedAmount);
    const chargedMatches = Number.isFinite(chargedAmount) ? chargedAmount >= (plan?.amount ?? expectedAmount ?? 0) : true;
    const currencyMatches = currency === 'NGN';
    const isSuccessful = flwStatus === 'successful';
    if (!isSuccessful || !plan || !amountMatches || !chargedMatches || !currencyMatches || !baseRecord.userId) {
      const reason = !isSuccessful ? 'not_successful' : !plan ? 'invalid_plan' : (!amountMatches || !chargedMatches) ? 'amount_mismatch' : !currencyMatches ? 'currency_mismatch' : 'missing_user';
      upsertPayment(store, { ...baseRecord, status: isSuccessful ? 'verification_failed' : flwStatus || 'unknown', verified: false, verifiedAt: null, verificationFailure: reason });
      writeStore(store);
      return res.status(200).json({ verified: false, status: isSuccessful ? 'verification_failed' : flwStatus || 'unknown', tx_ref: resolvedTxRef, transaction_id: resolvedTxId, message: 'Payment could not be verified. No subscription was activated.' });
    }
    const verifiedAt = nowIso();
    const paymentRecord = upsertPayment(store, { ...baseRecord, planId: plan.id, planName: plan.name, amount: plan.amount, currency: 'NGN', status: 'successful', verified: true, verifiedAt, verificationFailure: null });
    store.subscriptionsByUser[baseRecord.userId] = { userId: baseRecord.userId, planId: plan.id, planName: plan.name, price: plan.price, billing: plan.billing, amount: plan.amount, currency: 'NGN', status: 'active', tx_ref: paymentRecord.tx_ref, transaction_id: paymentRecord.transaction_id, verifiedAt, updatedAt: verifiedAt };
    writeStore(store);
    return res.status(200).json({ verified: true, status: 'successful', tx_ref: paymentRecord.tx_ref, transaction_id: paymentRecord.transaction_id, amount: paymentRecord.amount, currency: paymentRecord.currency, planId: plan.id, planName: plan.name, customer: paymentRecord.customer, subscription: subscriptionPublicRecord(store.subscriptionsByUser[baseRecord.userId]) });
  } catch (error) {
    return res.status(500).json({ verified: false, error: error.response?.data?.message || error.message || 'Verification failed' });
  }
});

app.post('/api/payments/cancel', (req, res) => {
  const { tx_ref, transaction_id, userId, reason } = req.body || {};
  if (!tx_ref && !transaction_id) return res.status(400).json({ error: 'tx_ref or transaction_id is required' });
  const store = readStore();
  const existing = findPayment(store, { tx_ref, transaction_id });
  const resolvedTxRef = tx_ref || existing?.tx_ref;
  const resolvedUserId = String(userId || existing?.userId || '');
  if (existing) {
    upsertPayment(store, { ...existing, status: 'cancelled', verified: false, updatedAt: nowIso(), cancelReason: reason || 'cancelled' });
  } else {
    upsertPayment(store, { tx_ref: resolvedTxRef, transaction_id: transaction_id ?? null, userId: resolvedUserId, planId: null, planName: null, amount: null, currency: null, status: 'cancelled', verified: false, createdAt: nowIso(), updatedAt: nowIso(), cancelReason: reason || 'cancelled' });
  }
  if (resolvedUserId) clearActiveSubscriptionForUser(store, resolvedUserId, reason || 'cancelled', resolvedTxRef);
  writeStore(store);
  return res.json({ ok: true, status: 'cancelled', tx_ref: resolvedTxRef });
});

app.get('/api/subscriptions/status', (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const store = readStore();
  const sub = subscriptionPublicRecord(store.subscriptionsByUser[userId]);
  return res.json({ subscription: sub });
});

app.get('/api/admin/subscriptions', (req, res) => {
  const store = readStore();
  const subscriptions = Object.values(store.subscriptionsByUser).map(subscriptionPublicRecord).filter(Boolean).sort((a, b) => String(b.verifiedAt).localeCompare(String(a.verifiedAt)));
  const payments = store.payments.slice().sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt))).map(paymentPublicRecord);
  return res.json({ subscriptions, payments });
});

app.post('/api/admin/reset-test-data', requireAdminResetAuth, (req, res) => {
  const confirm = req.body?.confirm;
  if (confirm !== 'RESET_STREAMORA_TEST_DATA') {
    return res.status(400).json({ error: 'Confirmation required' });
  }
  resetStore();
  return res.json({ ok: true, message: 'Test subscription/payment data reset.' });
});

const server = app.listen(PORT, () => {
  console.log('[streamora-server] running on http://localhost:' + PORT);
  console.log('[streamora-server] environment loaded from ' + ROOT_ENV_PATH);
  console.log('[streamora-server] FLW_SECRET_KEY configured: ' + hasFlwSecretKey);
  console.log('[streamora-server] ADMIN_RESET_TOKEN configured: ' + hasAdminResetToken);
  if (!hasFlwSecretKey) console.warn('[streamora-server] WARNING: FLW_SECRET_KEY is not set in the root .env file.');
  if (!hasAdminResetToken) console.warn('[streamora-server] WARNING: ADMIN_RESET_TOKEN is not set. /api/admin/reset-test-data will reject requests.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('[streamora-server] Port ' + PORT + ' is already in use. Stop the other process or set PORT in the root .env to a free port (update VITE_API_BASE_URL in the frontend to match).');
  } else {
    console.error('[streamora-server] Failed to start:', error.message);
  }
  process.exit(1);
});

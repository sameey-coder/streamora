import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const EMPTY_STORE = { payments: [], subscriptionsByUser: {} };

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2));
  }
}

export function readStore() {
  ensureStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      subscriptionsByUser:
        parsed.subscriptionsByUser && typeof parsed.subscriptionsByUser === 'object'
          ? parsed.subscriptionsByUser
          : {},
    };
  } catch {
    return { ...EMPTY_STORE, subscriptionsByUser: {} };
  }
}

export function writeStore(store) {
  ensureStore();
  const tmp = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_PATH);
}

export function resetStore() {
  writeStore({ payments: [], subscriptionsByUser: {} });
}

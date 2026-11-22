import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { useSubscription } from '../hooks/useSubscription.js'
import { PATHS } from '../routes/paths.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const CANCELLED_STATUSES = new Set(['cancelled', 'canceled', 'cancel'])
const FAILED_STATUSES = new Set(['failed', 'declined', 'error', 'abandoned'])

function cleanPaymentReference(value) {
  if (typeof value !== 'string') return null
  const reference = value.trim()
  if (!reference || ['undefined', 'null', '0'].includes(reference.toLowerCase())) return null
  return reference
}

function getCancelPath(txRef) {
  if (!txRef) return PATHS.paymentCancel
  return `${PATHS.paymentCancel}?tx_ref=${encodeURIComponent(txRef)}`
}

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const { selectPlan, refreshSubscription } = useSubscription()
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [verificationDone, setVerificationDone] = useState(false)
  const processedRef = useRef(null)
  const callbackStatus = (searchParams.get('status') || '').trim().toLowerCase()
  const tx_ref = cleanPaymentReference(searchParams.get('tx_ref'))
  const transaction_id = cleanPaymentReference(searchParams.get('transaction_id'))
  const isCancelledCallback = CANCELLED_STATUSES.has(callbackStatus)
  const isFailedCallback = FAILED_STATUSES.has(callbackStatus)
  const hasReference = Boolean(tx_ref || transaction_id)
  const loading = !isCancelledCallback && hasReference && !verificationDone
  const displayError = isFailedCallback
    ? 'Your payment failed. No subscription was activated.'
    : !isCancelledCallback && !hasReference
      ? 'No valid payment reference was returned. If you cancelled checkout, no subscription was activated.'
      : error

  useEffect(() => {
    if (isCancelledCallback) {
      navigate(getCancelPath(tx_ref), { replace: true, state: { notice: 'Payment was cancelled. No subscription was activated.' } })
      return
    }

    if (isFailedCallback || !hasReference) return

    const reference = tx_ref || transaction_id
    if (processedRef.current === reference) return
    processedRef.current = reference

    const verifyPayment = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx_ref, transaction_id, userId: String(user?.id || '') }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed')
        }

        const verifiedStatus = typeof data.status === 'string' ? data.status.trim().toLowerCase() : ''

        if (!data.verified && CANCELLED_STATUSES.has(verifiedStatus)) {
          navigate(getCancelPath(data.tx_ref || tx_ref), {
            replace: true,
            state: { notice: 'Payment was cancelled. No subscription was activated.' },
          })
          return
        }

        if (!data.verified && FAILED_STATUSES.has(verifiedStatus)) {
          setError('Your payment failed. No subscription was activated.')
          return
        }

        setPaymentData(data)
        setVerified(Boolean(data.verified))

        if (data.verified && data.subscription) {
          selectPlan(data.subscription)
        } else if (data.verified) {
          await refreshSubscription()
        } else {
          setError(data.message || 'Your payment could not be verified. No subscription was activated.')
        }
      } catch (err) {
        if (err instanceof TypeError) {
          setError(`Cannot reach the payment server at ${API_BASE}. Make sure the backend is running and try again.`)
        } else {
          setError(err.message || 'Verification failed')
        }
      } finally {
        setVerificationDone(true)
      }
    }

    verifyPayment()
  }, [hasReference, isCancelledCallback, isFailedCallback, navigate, refreshSubscription, selectPlan, transaction_id, tx_ref, user?.id])

  if (loading) {
    return (
      <PageShell title="Payment Success" description="Verifying payment...">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-14 text-center text-sm text-neutral-400">
          Verifying your payment...
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Payment Status" description="Payment verification result">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
        {verified ? (
          <>
            <h2 className="text-lg font-semibold text-green-400">Payment Successful</h2>
            <p className="mt-2 text-sm text-neutral-300">Your subscription has been activated.</p>
            {paymentData?.tx_ref && (
              <p className="mt-2 text-xs text-neutral-500 break-all">Reference: {paymentData.tx_ref}</p>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={() => navigate(PATHS.profile)} className="flex-1">
                View Profile
              </Button>
              <Button variant="secondary" onClick={() => navigate(PATHS.subscription)}>
                Subscription Plans
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-red-400">Payment Not Activated</h2>
            <p className="mt-2 text-sm text-neutral-300">
              {displayError || 'Your payment could not be verified. No subscription was activated.'}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => navigate(PATHS.subscription)} className="flex-1">
                Back to Plans
              </Button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}

export default PaymentSuccess

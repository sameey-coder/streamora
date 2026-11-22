import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { PATHS } from '../routes/paths.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const tx_ref = searchParams.get('tx_ref')
  const transaction_id = searchParams.get('transaction_id')

  useEffect(() => {
    if (!tx_ref && !transaction_id) return
    fetch(`${API_BASE}/api/payments/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tx_ref, transaction_id, userId: user?.id ? String(user.id) : undefined, reason: 'user_cancelled' }),
    }).catch(() => {})
  }, [tx_ref, transaction_id, user?.id])

  return (
    <PageShell title="Payment Cancelled" description="Payment was cancelled">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-yellow-400">Payment Cancelled</h2>
        <p className="mt-2 text-sm text-neutral-300">
          Your payment was cancelled. No subscription was activated.
        </p>
        {tx_ref && <p className="mt-2 text-xs text-neutral-500 break-all">Reference: {tx_ref}</p>}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(PATHS.subscription, {
                state: { notice: 'Payment was cancelled. No subscription was activated.' },
              })
            }
            className="flex-1"
          >
            Back to Plans
          </Button>
        </div>
      </div>
    </PageShell>
  )
}

export default PaymentCancel

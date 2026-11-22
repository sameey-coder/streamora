import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { PATHS } from '../routes/paths.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const PLANS = {
  standard: { id: 'standard', name: 'STANDARD', amount: 4500, price: '₦4,500/month', billing: 'Monthly' },
  premium: { id: 'premium', name: 'PREMIUM', amount: 7000, price: '₦7,000/month', billing: 'Monthly' },
}

function Payment() {
  const { user } = useAuthSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const submittingRef = useRef(false)
  const planId = location.state?.planId || location.state?.plan?.id
  const plan = planId && PLANS[planId] ? PLANS[planId] : null

  useEffect(() => {
    if (!plan) navigate(PATHS.subscription, { replace: true })
  }, [plan, navigate])

  const handlePay = async () => {
    if (!plan || !user || submittingRef.current) return

    submittingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          email: user.email,
          name: user.fullName,
          userId: String(user.id),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      if (typeof data.checkoutUrl === 'string' && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl)
        return
      }

      setError(data.error || 'Payment initiation failed: server did not return a Flutterwave checkout URL.')
    } catch (err) {
      if (err instanceof TypeError) {
        setError(`Cannot reach the payment server at ${API_BASE}. Make sure the backend is running (npm run dev:server) and try again.`)
      } else {
        setError(err.message || 'Payment initiation failed')
      }
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <PageShell title="Payment" description="Loading...">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-14 text-center text-sm text-neutral-400">
          Loading payment details...
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Payment" description="Complete your subscription payment">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm text-neutral-300">
          <div className="flex justify-between">
            <span>Plan</span>
            <span className="font-medium text-white">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-medium text-brand-400">{plan.price}</span>
          </div>
          <div className="flex justify-between">
            <span>Billing</span>
            <span>{plan.billing}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span className="truncate max-w-48">{user?.email}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="ghost" onClick={() => navigate(PATHS.subscription)} disabled={loading}>
            Back
          </Button>
          <Button variant="primary" onClick={handlePay} disabled={loading} className="flex-1">
            {loading ? 'Initiating...' : 'Pay with Flutterwave (Test)'}
          </Button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          You will be redirected to Flutterwave test checkout. Only a successfully verified payment activates your plan.
        </p>
      </div>
    </PageShell>
  )
}

export default Payment

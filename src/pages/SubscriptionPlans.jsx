import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useSubscription } from '../hooks/useSubscription.js'
import { PATHS } from '../routes/paths.js'

const PLANS = [
  {
    id: 'standard',
    name: 'STANDARD',
    price: '₦4,500/month',
    billing: 'Monthly',
    badge: 'Most Popular',
    features: ['Full HD Streaming', '2 devices', 'Full movie access', 'Popular choice'],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '₦7,000/month',
    billing: 'Monthly',
    features: ['4K Streaming', '4 devices', 'Full movie access', 'Priority features'],
  },
]

function SubscriptionPlans() {
  const { selectedPlan, refreshSubscription } = useSubscription()
  const navigate = useNavigate()
  const location = useLocation()
  const notice = location.state?.notice

  useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  function handleSelect(plan) {
    navigate(PATHS.payment, { state: { planId: plan.id } })
  }

  return (
    <PageShell title="Subscription Plans" description="Choose the plan that works best for you.">
      {notice ? (
        <div className="mb-6 rounded-xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan?.planId === plan.id && selectedPlan?.status === 'active'
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/60 ${
                plan.badge ? 'border-brand-500 hover:shadow-red-900/40' : 'hover:border-neutral-600'
              } ${isSelected ? 'ring-2 ring-brand-500/70' : ''}`}
            >
              {plan.badge ? (
                <span className="absolute right-4 top-4 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              ) : null}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-2 text-3xl font-bold text-white">{plan.price}</div>
              <div className="text-sm text-neutral-400">{plan.billing}</div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="mt-0.5 size-4 text-brand-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {isSelected ? (
                <div className="mt-6 rounded-lg border border-brand-500/60 bg-brand-600/20 px-3 py-2 text-center text-sm font-medium text-brand-300">
                  Current Plan
                </div>
              ) : (
                <Button className="mt-6 w-full" variant="primary" onClick={() => handleSelect(plan)}>
                  Select Plan
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}

export default SubscriptionPlans

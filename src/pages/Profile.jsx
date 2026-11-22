import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import LogoutConfirmModal from '../components/common/LogoutConfirmModal.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { useFavourites } from '../hooks/useFavourites.js'
import { useSubscription } from '../hooks/useSubscription.js'
import { findStoredUserById } from '../utils/auth.js'
import { PATHS } from '../routes/paths.js'

const REVIEWS_STORAGE_KEY = 'streamora:reviews'

function readReviewsMap() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function countUserReviews(userId) {
  if (userId == null) return 0
  const map = readReviewsMap()
  return Object.values(map).reduce((total, list) => {
    if (!Array.isArray(list)) return total
    return total + list.filter((review) => review.userId === userId).length
  }, 0)
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'U'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z" />
    </svg>
  )
}

function CrownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l4 4 5-6 5 6 4-4-2 11H5z" />
      <path d="M5 20h14" />
    </svg>
  )
}

function ActivityRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
          {icon}
        </span>
        <span className="truncate text-sm text-neutral-300">{label}</span>
      </div>
      <span className="shrink-0 text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function AccountDetailsCard({ user, onUpdate }) {
  const [name, setName] = useState(user.fullName ?? '')
  const [status, setStatus] = useState(null)

  const trimmed = name.trim()
  const isDirty = trimmed !== (user.fullName ?? '')

  function handleSubmit(event) {
    event.preventDefault()
    if (!trimmed) {
      setStatus({ type: 'error', message: 'Display name cannot be empty.' })
      return
    }
    if (trimmed.length > 60) {
      setStatus({ type: 'error', message: 'Display name must be 60 characters or fewer.' })
      return
    }
    if (!isDirty) {
      setStatus({ type: 'error', message: 'That is already your display name.' })
      return
    }
    onUpdate({ fullName: trimmed })
    setStatus({ type: 'success', message: 'Display name updated.' })
  }

  function handleReset() {
    setName(user.fullName ?? '')
    setStatus(null)
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-white sm:text-lg">Account Details</h3>
      <p className="mt-1 text-sm text-neutral-400">Update the name shown across STREAMORA.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-neutral-200">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (status) setStatus(null)
            }}
            autoComplete="name"
            maxLength={60}
            className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="profileEmail" className="block text-sm font-medium text-neutral-200">
            Email Address
          </label>
          <input
            id="profileEmail"
            name="profileEmail"
            type="email"
            value={user.email}
            readOnly
            disabled
            aria-describedby="profileEmailHint"
            className="mt-2 w-full cursor-not-allowed rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2.5 text-sm text-neutral-400"
          />
          <p id="profileEmailHint" className="mt-2 text-xs leading-relaxed text-neutral-500">
            Email is read-only. STREAMORA accounts here are stored in this browser and use
            your email as the unique sign-in identifier. There is no verification step, so
            changing the email in the frontend alone could leave your stored credentials
            out of sync and lock you out.
          </p>
        </div>

        {status ? (
          <p
            role="status"
            className={
              status.type === 'success'
                ? 'rounded-lg border border-green-900 bg-green-950/40 px-4 py-2 text-sm text-green-300'
                : 'rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300'
            }
          >
            {status.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" disabled={!isDirty}>
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
        </div>
      </form>
    </section>
  )
}

function Profile() {
  const { user, logout, updateProfile } = useAuthSession()
  const { count: favouritesCount } = useFavourites()
  const { selectedPlan, loading: subscriptionLoading, refreshSubscription } = useSubscription()
  const navigate = useNavigate()

  const [logoutOpen, setLogoutOpen] = useState(false)

  const storedUser = useMemo(() => (user ? findStoredUserById(user.id) : null), [user])
  const reviewCount = useMemo(() => countUserReviews(user?.id), [user?.id])
  const memberSince = formatDate(storedUser?.createdAt)
  const hasActivePlan = selectedPlan?.status === 'active'

  useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  if (!user) return null

  function handleLogoutConfirm() {
    logout()
    setLogoutOpen(false)
    navigate(PATHS.login)
  }

  return (
    <PageShell title="Profile" description="Manage your account details and preferences.">
      <section className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-black/40 sm:size-20">
            {getInitials(user.fullName)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
              {user.fullName}
            </h2>
            <p className="truncate text-sm text-neutral-400">{user.email}</p>
            {memberSince ? <p className="mt-1 text-xs text-neutral-500">Member since {memberSince}</p> : null}
            <p className="mt-2 text-xs text-neutral-400">
              Subscription: {subscriptionLoading ? 'Checking…' : hasActivePlan ? `${selectedPlan.planName} (Active)` : 'No Active Subscription'}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AccountDetailsCard user={user} onUpdate={updateProfile} />

        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">Subscription</h3>
            <p className="mt-1 text-sm text-neutral-400">Your current verified subscription status.</p>

            <div className="mt-5 space-y-3">
              <ActivityRow
                icon={<CrownIcon />}
                label="Current plan"
                value={subscriptionLoading ? 'Checking…' : hasActivePlan ? selectedPlan.planName : 'No Active Subscription'}
              />
              <ActivityRow
                icon={<StarIcon />}
                label="Subscription status"
                value={subscriptionLoading ? 'Checking…' : hasActivePlan ? 'Active' : 'No Active Subscription'}
              />
              <ActivityRow
                icon={<HeartIcon />}
                label="Billing"
                value={subscriptionLoading ? 'Checking…' : hasActivePlan ? `${selectedPlan.price} · ${selectedPlan.billing}` : '—'}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button as={Link} to={PATHS.subscription} variant="secondary">
                {hasActivePlan ? 'Manage Subscription Plans' : 'View Subscription Plans'}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">Account Activity</h3>
            <p className="mt-1 text-sm text-neutral-400">Based on data saved on this device.</p>
            <div className="mt-5 space-y-3">
              <ActivityRow icon={<HeartIcon />} label="Favourite movies" value={favouritesCount} />
              <ActivityRow icon={<StarIcon />} label="Reviews submitted" value={reviewCount} />
            </div>
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white sm:text-lg">Quick Links</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button as={Link} to={PATHS.favourites} variant="secondary">
            Favourites
          </Button>
          <Button as={Link} to={PATHS.subscription} variant="secondary">
            Subscription Plans
          </Button>
          <Button as={Link} to={PATHS.browse} variant="secondary">
            Browse Movies
          </Button>
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Sign Out</h3>
          <p className="mt-1 text-sm text-neutral-400">Log out of your STREAMORA account on this device.</p>
        </div>
        <Button variant="primary" onClick={() => setLogoutOpen(true)}>
          Log Out
        </Button>
      </section>

      <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
    </PageShell>
  )
}

export default Profile

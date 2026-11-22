import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import TmdbImage from '../components/movies/TmdbImage.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { useFavourites } from '../hooks/useFavourites.js'
import { useSubscription } from '../hooks/useSubscription.js'
import { useTmdbMovies } from '../hooks/useTmdbMovies.js'
import { useContent } from '../hooks/useContent.js'
import { normalizeContent, toFeaturedMovie, PROMO_MAX_LENGTH } from '../context/contentContext.js'
import { readStoredUsers, setStoredUserStatus, ACCOUNT_STATUS } from '../utils/auth.js'
import { isAdminUser, DEMO_ADMIN_EMAILS, normalizeEmail } from '../utils/roles.js'
import { PATHS } from '../routes/paths.js'
import { cn } from '../utils/cn.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function normalizeStatus(value) {
  if (value === ACCOUNT_STATUS.deactivated) return ACCOUNT_STATUS.deactivated
  return ACCOUNT_STATUS.active
}

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'content', label: 'Content', icon: 'film' },
  { id: 'subscriptions', label: 'Subscriptions & Payments', icon: 'card' },
]

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function Icon({ name, className = 'size-5' }) {
  const common = {
    'aria-hidden': 'true',
    viewBox: '0 0 24 24',
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.75',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (name) {
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
          <path d="M17.5 14.2A6.5 6.5 0 0 1 21.5 20" />
        </svg>
      )
    case 'film':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'card':
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="M2.5 10h19M6.5 15h4" />
        </svg>
      )
    case 'crown':
      return (
        <svg {...common}>
          <path d="M3 7l4 4 5-6 5 6 4-4-2 11H5z" />
          <path d="M5 20h14" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      )
    default:
      return null
  }
}

function RoleBadge({ admin }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        admin ? 'bg-brand-600/20 text-brand-300' : 'bg-neutral-800 text-neutral-300',
      )}
    >
      {admin ? 'Admin' : 'User'}
    </span>
  )
}

function StatusBadge({ tone = 'muted', children }) {
  const tones = {
    muted: 'bg-neutral-800 text-neutral-400',
    warn: 'bg-amber-500/15 text-amber-300',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        tones[tone] ?? tones.muted,
      )}
    >
      {children}
    </span>
  )
}

function StatCard({ icon, label, value, hint, unavailable = false }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/50">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600/15 text-brand-400 transition-colors group-hover:bg-brand-600/25">
          <Icon name={icon} />
        </span>
        {unavailable ? <StatusBadge tone="warn">Unavailable</StatusBadge> : null}
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm font-medium text-neutral-300">{label}</div>
      {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
    </div>
  )
}

function Panel({ title, description, children, footer }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <header className="border-b border-neutral-800 px-5 py-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-neutral-400">{description}</p> : null}
      </header>
      {children}
      {footer ? (
        <p className="border-t border-neutral-800 px-5 py-3 text-xs leading-relaxed text-neutral-500">
          {footer}
        </p>
      ) : null}
    </section>
  )
}

function TableWrap({ children }) {
  return <div className="overflow-x-auto">{children}</div>
}

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-sm text-neutral-400">
        {message}
      </td>
    </tr>
  )
}

function EmptyState({ title, message }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-medium text-neutral-200">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{message}</p>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuthSession()
  const { count: favouritesCount } = useFavourites()
  const { selectedPlan, refreshSubscription } = useSubscription()
  const {
    movies,
    totalResults,
    loading: moviesLoading,
    error: moviesError,
  } = useTmdbMovies('movie/popular', { page: 1 })
  const { featured, heroId, promo, saveContent } = useContent()
  const [activeSection, setActiveSection] = useState('overview')
  const [users, setUsers] = useState(() => readStoredUsers())
  const [actionMessage, setActionMessage] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [draftContent, setDraftContent] = useState(() => ({ featured, heroId, promo }))
  const [draftSynced, setDraftSynced] = useState(false)
  const draftFeatured = draftSynced ? draftContent.featured : featured
  const draftHeroId = draftSynced ? draftContent.heroId : heroId
  const draftPromo = draftSynced ? draftContent.promo : promo
  const [contentMessage, setContentMessage] = useState(null)
  const [contentError, setContentError] = useState(null)
  const [paymentRecords, setPaymentRecords] = useState([])
  const [activeSubscriptions, setActiveSubscriptions] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState(null)
  const [resetMessage, setResetMessage] = useState(null)

  const setDraftFeatured = useCallback((value) => {
    setDraftSynced(true)
    setDraftContent((prev) => {
      const base = prev.featured.length || prev.heroId || prev.promo.text || prev.promo.enabled ? prev : { featured, heroId, promo }
      return { ...base, featured: typeof value === 'function' ? value(base.featured) : value }
    })
  }, [featured, heroId, promo])

  const setDraftHeroId = useCallback((value) => {
    setDraftSynced(true)
    setDraftContent((prev) => {
      const base = prev.featured.length || prev.heroId || prev.promo.text || prev.promo.enabled ? prev : { featured, heroId, promo }
      return { ...base, heroId: typeof value === 'function' ? value(base.heroId) : value }
    })
  }, [featured, heroId, promo])

  const setDraftPromo = useCallback((value) => {
    setDraftSynced(true)
    setDraftContent((prev) => {
      const base = prev.featured.length || prev.heroId || prev.promo.text || prev.promo.enabled ? prev : { featured, heroId, promo }
      return { ...base, promo: typeof value === 'function' ? value(base.promo) : value }
    })
  }, [featured, heroId, promo])

  const refreshUsers = useCallback(() => {
    setUsers(readStoredUsers())
  }, [])

  const refreshPaymentData = useCallback(async () => {
    setPaymentsLoading(true)
    setPaymentsError(null)
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscriptions`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to load subscription data')
      setPaymentRecords(Array.isArray(data.payments) ? data.payments : [])
      setActiveSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : [])
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Failed to load subscription data')
      setPaymentRecords([])
      setActiveSubscriptions([])
    } finally {
      setPaymentsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional initial data load for admin dashboard
    void refreshPaymentData()
  }, [refreshPaymentData])

  const handleResetTestData = useCallback(async () => {
    if (!confirm('Reset test subscription and payment data? This clears the server test store and local active subscription.')) return
    setResetMessage(null)
    setPaymentsError(null)
    const adminToken = window.prompt('Enter demo admin reset token (server ADMIN_RESET_TOKEN):')
    if (adminToken === null) return
    if (!adminToken.trim()) {
      setPaymentsError('Admin reset token is required.')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-test-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-streamora-admin-token': adminToken.trim() },
        body: JSON.stringify({ confirm: 'RESET_STREAMORA_TEST_DATA' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      try { window.localStorage.removeItem('streamora:subscription') } catch {}
      await refreshSubscription()
      await refreshPaymentData()
      setResetMessage('Test subscription/payment data reset. You can test from scratch.')
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Reset failed')
    }
  }, [refreshPaymentData, refreshSubscription])

  const draftIsFeatured = useCallback((id) => draftFeatured.some((m) => m.id === Number(id)), [draftFeatured])

  const handleToggleFeatured = useCallback((movie) => {
    const next = toFeaturedMovie(movie)
    if (!next) return
    setContentMessage(null)
    setContentError(null)
    const exists = draftFeatured.some((m) => m.id === next.id)
    if (exists) {
      const filtered = draftFeatured.filter((m) => m.id !== next.id)
      setDraftFeatured(filtered)
      setDraftHeroId((hero) => (hero === next.id ? (filtered[0]?.id ?? null) : hero))
      return
    }
    setDraftFeatured([...draftFeatured, next])
    setDraftHeroId((hero) => hero ?? next.id)
  }, [draftFeatured, setDraftFeatured, setDraftHeroId])

  const handleSetHero = useCallback((id) => {
    setContentMessage(null)
    setContentError(null)
    setDraftHeroId(id)
  }, [setDraftHeroId])

  const handleRemoveFeatured = useCallback((id) => {
    setContentMessage(null)
    setContentError(null)
    const filtered = draftFeatured.filter((m) => m.id !== id)
    setDraftFeatured(filtered)
    setDraftHeroId((hero) => (hero === id ? (filtered[0]?.id ?? null) : hero))
  }, [draftFeatured, setDraftFeatured, setDraftHeroId])

  const handlePromoToggle = useCallback((enabled) => {
    setContentMessage(null)
    setContentError(null)
    setDraftPromo((p) => ({ ...p, enabled }))
  }, [setDraftPromo])

  const handlePromoText = useCallback((text) => {
    setContentMessage(null)
    setContentError(null)
    setDraftPromo((p) => ({ ...p, text }))
  }, [setDraftPromo])

  const handleSaveContent = useCallback(() => {
    const next = normalizeContent({ featured: draftFeatured, heroId: draftHeroId, promo: draftPromo })
    const ok = saveContent(next)
    if (ok) {
      setContentError(null)
      setContentMessage('Saved. The Home page hero now uses these featured selections on this browser.')
    } else {
      setContentMessage(null)
      setContentError("Could not save to this browser's storage.")
    }
  }, [draftFeatured, draftHeroId, draftPromo, saveContent])

  const handleResetContent = useCallback(() => {
    setDraftContent({ featured, heroId, promo })
    setDraftSynced(false)
    setContentMessage(null)
    setContentError(null)
  }, [featured, heroId, promo])

  const handleToggleStatus = useCallback((account) => {
    const normalized = normalizeEmail(account.email)
    const isAdmin = isAdminUser(account) || DEMO_ADMIN_EMAILS.includes(normalized)
    if (isAdmin) {
      setActionError('Admin accounts cannot be deactivated through this action.')
      setActionMessage(null)
      return
    }
    const currentStatus = normalizeStatus(account.status)
    if (currentStatus === ACCOUNT_STATUS.deactivated) {
      if (!confirm('Activate this user account? They will be able to sign in again.')) return
      const updated = setStoredUserStatus(account.id, ACCOUNT_STATUS.active)
      refreshUsers()
      setActionError(null)
      setActionMessage(updated ? `Activated ${account.email}.` : 'Status updated.')
      return
    }
    if (!confirm('Deactivate this user account? They will not be able to sign in or access protected features.')) return
    const updated = setStoredUserStatus(account.id, ACCOUNT_STATUS.deactivated)
    refreshUsers()
    setActionError(null)
    setActionMessage(updated ? `Deactivated ${account.email}.` : 'Status updated.')
  }, [refreshUsers])

  const movieCount = movies?.length ?? 0
  const subscriptionCount = activeSubscriptions.length
  const successfulPayments = paymentRecords.filter((p) => p.verified && p.status === 'successful').length
  const catalogueValue = moviesLoading ? '…' : moviesError ? '—' : movieCount

  return (
    <PageShell
      title="Admin Dashboard"
      description="A frontend demo overview of the data STREAMORA holds on this device."
    >
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-900/50 bg-amber-950/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-amber-300/90">
          Demo only — this is client-side role authentication with no real authorization, and
          every metric below is read from this browser&apos;s local storage and the live TMDB API.
          Nothing here is server-stored or production-secure.
        </p>
        <span className="shrink-0">
          <RoleBadge admin />
        </span>
      </div>

      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 hidden rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 lg:block">
            <p className="text-xs text-neutral-500">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-medium text-white">{user?.fullName}</p>
            <p className="truncate text-xs text-neutral-500">{user?.email}</p>
          </div>

          <nav
            aria-label="Dashboard sections"
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
          >
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:w-full',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-red-900/30'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white',
                  )}
                >
                  <Icon name={section.icon} className="size-4 shrink-0" />
                  {section.label}
                </button>
              )
            })}

            <Link
              to={PATHS.home}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white lg:mt-4 lg:w-full lg:border-t lg:border-neutral-800 lg:pt-4"
            >
              <Icon name="arrow" className="size-4 shrink-0" />
              Back to STREAMORA
            </Link>
          </nav>
        </aside>

        <div className="mt-6 min-w-0 space-y-6 lg:mt-0">
          {activeSection === 'overview' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon="users"
                label="Registered users"
                value={users.length}
                hint="Demo accounts stored in this browser"
              />
              <StatCard
                icon="crown"
                label="Active subscriptions"
                value={paymentsLoading ? '…' : subscriptionCount}
                hint={subscriptionCount > 0 ? 'Verified active plans from server records' : 'No verified active subscriptions'}
              />
              <StatCard
                icon="card"
                label="Successful payments"
                value={paymentsLoading ? '…' : successfulPayments}
                hint={paymentRecords.length > 0 ? `${paymentRecords.length} total payment record(s)` : 'No payment records yet'}
              />
              <StatCard
                icon="heart"
                label="Favourites"
                value={favouritesCount}
                hint="Saved on this device"
              />
              <StatCard
                icon="film"
                label="Catalogue activity"
                value={catalogueValue}
                unavailable={Boolean(moviesError)}
                hint={
                  moviesError
                    ? 'TMDB could not be reached'
                    : totalResults
                      ? `${totalResults.toLocaleString()} titles available in TMDB popular`
                      : 'Live titles loaded from TMDB'
                }
              />
            </div>
          ) : null}

          {activeSection === 'users' ? (
            <Panel
              title="Registered Users"
              description="Demo accounts stored in this browser. Passwords are never read or displayed."
              footer={
                <>
                  Verified active subscriptions are stored on the server after Flutterwave verification
                  and linked to user IDs. Current device session plan: {selectedPlan?.planName ?? 'None'}.
                </>
              }
            >
              {actionError ? (
                <div className="m-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                  {actionError}
                </div>
              ) : null}
              {actionMessage ? (
                <div className="m-5 rounded-lg border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
                  {actionMessage}
                </div>
              ) : null}
              <TableWrap>
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead className="bg-neutral-950/40 text-xs tracking-wider text-neutral-500 uppercase">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Email</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Account Status</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <EmptyRow colSpan={6} message="No demo accounts registered in this browser yet." />
                    ) : (
                      users.map((account) => {
                        const accountAdmin = isAdminUser(account)
                        const status = normalizeStatus(account.status)
                        const deactivated = status === ACCOUNT_STATUS.deactivated
                        const isSelf = user && account.id === user.id
                        const disabledReason = accountAdmin
                          ? 'Admin accounts cannot be deactivated'
                          : isSelf
                            ? 'Cannot deactivate the currently signed-in account'
                            : null
                        return (
                          <tr
                            key={account.id}
                            className="border-t border-neutral-800 transition-colors hover:bg-neutral-800/40"
                          >
                            <td className="px-5 py-3 font-medium text-white">{account.fullName || '—'}</td>
                            <td className="px-5 py-3 text-neutral-300">{account.email || '—'}</td>
                            <td className="px-5 py-3">
                              <RoleBadge admin={accountAdmin} />
                            </td>
                            <td className="px-5 py-3">
                              {deactivated ? (
                                <StatusBadge tone="warn">Deactivated</StatusBadge>
                              ) : (
                                <StatusBadge tone="muted">Active</StatusBadge>
                              )}
                            </td>
                            <td className="px-5 py-3 text-neutral-400">{formatDate(account.createdAt)}</td>
                            <td className="px-5 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={deactivated ? 'primary' : 'secondary'}
                                  disabled={Boolean(disabledReason)}
                                  onClick={() => handleToggleStatus(account)}
                                  title={disabledReason || undefined}
                                >
                                  {deactivated ? 'Activate' : 'Deactivate'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </TableWrap>
            </Panel>
          ) : null}

          {activeSection === 'content' ? (
            <div className="space-y-6">
              <Panel
                title="Movie Content"
                description="Live titles from the TMDB API — the same catalogue data used across STREAMORA. Select featured titles below to curate the Home hero."
              >
                {moviesLoading ? (
                  <div className="px-5 py-10 text-center text-sm text-neutral-400">
                    Loading movies from TMDB…
                  </div>
                ) : moviesError ? (
                  <div className="m-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                    Could not load movies from TMDB: {moviesError.message}
                  </div>
                ) : (
                  <TableWrap>
                    <table className="w-full min-w-[36rem] text-left text-sm">
                      <thead className="bg-neutral-950/40 text-xs tracking-wider text-neutral-500 uppercase">
                        <tr>
                          <th scope="col" className="px-5 py-3 font-semibold">Title</th>
                          <th scope="col" className="px-5 py-3 font-semibold">TMDB Rating</th>
                          <th scope="col" className="px-5 py-3 font-semibold">Release Year</th>
                          <th scope="col" className="px-5 py-3 font-semibold">Featured</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movieCount === 0 ? (
                          <EmptyRow colSpan={4} message="TMDB returned no movies right now." />
                        ) : (
                          movies.map((movie) => (
                            <tr
                              key={movie.id}
                              className="border-t border-neutral-800 transition-colors hover:bg-neutral-800/40"
                            >
                              <td className="px-5 py-3 font-medium text-white">
                                {movie.title || movie.original_title}
                              </td>
                              <td className="px-5 py-3 text-brand-400">
                                {movie.vote_count > 0 && movie.vote_average > 0
                                  ? `⭐ ${movie.vote_average.toFixed(1)}`
                                  : '—'}
                              </td>
                              <td className="px-5 py-3 text-neutral-400">
                                {movie.release_date ? movie.release_date.slice(0, 4) : '—'}
                              </td>
                              <td className="px-5 py-3">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={draftIsFeatured(movie.id) ? 'primary' : 'secondary'}
                                  onClick={() => handleToggleFeatured(movie)}
                                >
                                  {draftIsFeatured(movie.id) ? 'Featured' : 'Add to featured'}
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </TableWrap>
                )}
              </Panel>

              <Panel
                title="Featured Movies"
                description="Choose which TMDB titles are featured on the Home page. The 'Hero' title is shown in the Home hero banner."
              >
                {draftFeatured.length === 0 ? (
                  <EmptyState
                    title="No featured movies selected"
                    message="Use the catalogue table above to add featured movies. Until you save a selection, the Home hero falls back to a popular TMDB title."
                  />
                ) : (
                  <ul className="divide-y divide-neutral-800">
                    {draftFeatured.map((movie) => {
                      const isHero = movie.id === draftHeroId
                      return (
                        <li
                          key={movie.id}
                          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <TmdbImage
                              path={movie.poster_path}
                              variant="poster"
                              alt=""
                              className="h-16 w-11 shrink-0 rounded object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{movie.title}</p>
                              <p className="text-xs text-neutral-400">
                                {movie.release_date ? movie.release_date.slice(0, 4) : '—'}
                                {movie.vote_average
                                  ? ` · ⭐ ${Number(movie.vote_average).toFixed(1)}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {isHero ? (
                              <StatusBadge tone="muted">Hero</StatusBadge>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSetHero(movie.id)}
                              >
                                Set as hero
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFeatured(movie.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Panel>

              <Panel
                title="Promotional Banner"
                description="Optional promotional text shown above the title in the Home hero. Leave disabled to keep the default 'Featured this week' label."
              >
                <div className="space-y-4 px-5 py-5">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={draftPromo.enabled}
                      onChange={(event) => handlePromoToggle(event.target.checked)}
                      className="mt-1 size-4 rounded border-neutral-700 bg-neutral-950 text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-neutral-200">
                        Show promotional text on the Home hero
                      </span>
                      <span className="block text-xs text-neutral-500">
                        Replaces the default "Featured this week" eyebrow.
                      </span>
                    </span>
                  </label>
                  <div>
                    <label htmlFor="promoText" className="block text-sm font-medium text-neutral-200">
                      Promotional text
                    </label>
                    <input
                      id="promoText"
                      type="text"
                      value={draftPromo.text}
                      maxLength={PROMO_MAX_LENGTH}
                      disabled={!draftPromo.enabled}
                      onChange={(event) => handlePromoText(event.target.value)}
                      className={cn(
                        'mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                        !draftPromo.enabled && 'cursor-not-allowed opacity-60',
                      )}
                      placeholder="e.g. New this week"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      {draftPromo.text.length}/{PROMO_MAX_LENGTH}
                    </p>
                  </div>
                </div>
              </Panel>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                {contentError ? (
                  <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                    {contentError}
                  </div>
                ) : null}
                {contentMessage ? (
                  <div className="mb-4 rounded-lg border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
                    {contentMessage}
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="primary" onClick={handleSaveContent}>
                    Save changes
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleResetContent}>
                    Reset
                  </Button>
                  <p className="text-xs text-neutral-500">
                    Saved to this browser only (streamora:content). Demo only — not a real server.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === 'subscriptions' ? (
              <div className="space-y-6">
                <Panel
                  title="Subscriptions"
                  description="Verified active subscriptions from server payment records."
                >
                  <div className="flex flex-wrap items-center gap-3 px-5 pt-4">
                    <Button type="button" variant="secondary" size="sm" onClick={refreshPaymentData} disabled={paymentsLoading}>
                      {paymentsLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleResetTestData} disabled={paymentsLoading}>
                      Reset Test Data
                    </Button>
                  </div>
                  {resetMessage ? (
                    <div className="mx-5 mt-4 rounded-lg border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
                      {resetMessage}
                    </div>
                  ) : null}
                  {paymentsError ? (
                    <div className="mx-5 mt-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                      {paymentsError}
                    </div>
                  ) : null}
                  {paymentsLoading ? (
                    <div className="px-5 py-10 text-center text-sm text-neutral-400">Loading subscription records...</div>
                  ) : activeSubscriptions.length === 0 ? (
                    <EmptyState
                      title="No active subscriptions"
                      message="Only successfully verified payments activate subscriptions. Cancelled or failed payments do not appear here."
                    />
                  ) : (
                    <TableWrap>
                      <table className="w-full min-w-[40rem] text-left text-sm">
                        <thead className="bg-neutral-950/40 text-xs tracking-wider text-neutral-500 uppercase">
                          <tr>
                            <th scope="col" className="px-5 py-3 font-semibold">User</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Plan</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Verified</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeSubscriptions.map((sub) => (
                            <tr key={sub.tx_ref} className="border-t border-neutral-800">
                              <td className="px-5 py-3 text-neutral-300">{sub.userId}</td>
                              <td className="px-5 py-3 font-medium text-white">{sub.planName}</td>
                              <td className="px-5 py-3"><StatusBadge tone="muted">Active</StatusBadge></td>
                              <td className="px-5 py-3 text-neutral-400">{formatDate(sub.verifiedAt)}</td>
                              <td className="px-5 py-3 text-xs text-neutral-500 break-all">{sub.tx_ref}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrap>
                  )}
                </Panel>

                <Panel
                  title="Payments"
                  description="Payment records from server verification. Cancelled/failed records are kept for history but never activate plans."
                >
                  {paymentsLoading ? (
                    <div className="px-5 py-10 text-center text-sm text-neutral-400">Loading payment records...</div>
                  ) : paymentRecords.length === 0 ? (
                    <EmptyState
                      title="No payment records"
                      message="After a user attempts checkout, records will appear here with their verified status."
                    />
                  ) : (
                    <TableWrap>
                      <table className="w-full min-w-[48rem] text-left text-sm">
                        <thead className="bg-neutral-950/40 text-xs tracking-wider text-neutral-500 uppercase">
                          <tr>
                            <th scope="col" className="px-5 py-3 font-semibold">Updated</th>
                            <th scope="col" className="px-5 py-3 font-semibold">User</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Plan</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Amount</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentRecords.map((p) => (
                            <tr key={p.tx_ref} className="border-t border-neutral-800">
                              <td className="px-5 py-3 text-neutral-400">{formatDate(p.updatedAt || p.createdAt)}</td>
                              <td className="px-5 py-3 text-neutral-300">{p.userId || '—'}</td>
                              <td className="px-5 py-3 text-white">{p.planName || p.planId || '—'}</td>
                              <td className="px-5 py-3 text-neutral-300">{p.amount ? `₦${Number(p.amount).toLocaleString()}` : '—'}</td>
                              <td className="px-5 py-3">
                                {p.verified && p.status === 'successful' ? (
                                  <StatusBadge tone="muted">Successful</StatusBadge>
                                ) : p.status === 'cancelled' ? (
                                  <StatusBadge tone="warn">Cancelled</StatusBadge>
                                ) : p.status === 'failed' ? (
                                  <StatusBadge tone="warn">Failed</StatusBadge>
                                ) : (
                                  <StatusBadge tone="warn">{p.status || 'Unknown'}</StatusBadge>
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs text-neutral-500 break-all">{p.tx_ref}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrap>
                  )}
                </Panel>
              </div>
            ) : null}

        </div>
      </div>
    </PageShell>
  )
}

export default AdminDashboard

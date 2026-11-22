import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { DEMO_ADMIN_EMAILS, isAdminUser } from '../utils/roles.js'
import { PATHS } from '../routes/paths.js'

const DEMO_ADMIN_EMAIL = DEMO_ADMIN_EMAILS[0]

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, logout, user, isAuthenticated, loading } = useAuthSession()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [validation, setValidation] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from || PATHS.admin

  useEffect(() => {
    if (isAuthenticated && isAdminUser(user)) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, user, navigate, redirectTo])

  function validate(values) {
    const errors = {}
    if (!values.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      errors.email = 'Invalid email format'
    if (!values.password) errors.password = 'Password is required'
    return errors
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate(form)
    setValidation(errors)
    if (Object.keys(errors).length > 0) return
    setIsSubmitting(true)
    try {
      const sessionUser = await login({ email: form.email, password: form.password })
      if (!isAdminUser(sessionUser)) {
        logout()
        setValidation({ submit: 'This account does not have administrator access.' })
        return
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setValidation({ submit: err?.message || 'Invalid email or password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageShell title="Admin Sign In" description="Restricted area.">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-14 text-center text-sm text-neutral-400">
          Checking your session…
        </div>
      </PageShell>
    )
  }

  if (isAuthenticated && !isAdminUser(user)) {
    return (
      <PageShell title="Admin Sign In" description="Restricted area.">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-lg sm:px-8 sm:py-10">
          <h2 className="text-lg font-semibold text-white">Access denied</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            You are signed in as <span className="text-neutral-200">{user?.email}</span>, which is a
            regular user account. Administrator access is required to open the dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => {
                logout()
                setForm({ email: '', password: '' })
                setValidation({})
              }}
            >
              Sign out
            </Button>
            <Button as={Link} to={PATHS.home} variant="ghost">
              Back to STREAMORA
            </Button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Admin Sign In"
      description="Sign in with an administrator account to open the dashboard."
    >
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-lg sm:px-8 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {validation.submit ? (
            <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300">
              {validation.submit}
            </p>
          ) : null}

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-neutral-200">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              placeholder={DEMO_ADMIN_EMAIL}
            />
            {validation.email ? <p className="mt-1 text-xs text-red-400">{validation.email}</p> : null}
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-neutral-200">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 pr-10 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {validation.password ? (
              <p className="mt-1 text-xs text-red-400">{validation.password}</p>
            ) : null}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In to Admin'}
          </Button>

          <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-xs leading-relaxed text-amber-300/90">
            Demo only. Admin access is a client-side role flag with no real server
            authorization. To create the demo admin, register at{' '}
            <Link to={PATHS.register} className="font-medium text-amber-200 underline">
              Sign Up
            </Link>{' '}
            using <span className="font-medium text-amber-200">{DEMO_ADMIN_EMAIL}</span>, then return
            here to sign in.
          </div>

          <p className="text-center text-sm text-neutral-400">
            Not an admin?{' '}
            <Link to={PATHS.login} className="font-medium text-brand-400 hover:text-brand-300">
              Go to the regular login
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}

export default AdminLogin

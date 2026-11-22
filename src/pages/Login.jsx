import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { PATHS } from '../routes/paths.js'

function getSafeRedirectPath(from) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : PATHS.home
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuthSession()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [validation, setValidation] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectPath = getSafeRedirectPath(location.state?.from)
  const locationMessage = typeof location.state?.message === 'string' ? location.state.message : null

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectPath])

  function validate(values) {
    const errors = {}
    if (!values.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Invalid email format'
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
      await login({ email: form.email, password: form.password })
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setValidation({ submit: err?.message || 'Invalid email or password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="Log In" description="Sign in to your STREAMORA account.">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-lg sm:px-8 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {locationMessage ? (
            <p className="rounded-lg border border-yellow-900 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-200">{locationMessage}</p>
          ) : null}
          {validation.submit ? (
            <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300">{validation.submit}</p>
          ) : null}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              placeholder="you@example.com"
            />
            {validation.email ? <p className="mt-1 text-xs text-red-400">{validation.email}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-200">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
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
            {validation.password ? <p className="mt-1 text-xs text-red-400">{validation.password}</p> : null}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-neutral-400">
            Don't have an account?{' '}
            <Link to={PATHS.register} className="font-medium text-brand-400 hover:text-brand-300">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}

export default Login

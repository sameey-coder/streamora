import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { PATHS } from '../routes/paths.js'

function Register() {
  const navigate = useNavigate()
  const { register, isSubmitting, error } = useAuth()
  const { isAuthenticated } = useAuthSession()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validation, setValidation] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(PATHS.home, { replace: true })
    }
  }, [isAuthenticated, navigate])

  function validate(values) {
    const errors = {}
    if (!values.fullName.trim()) errors.fullName = 'Full name is required'
    if (!values.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Invalid email format'
    if (!values.password) errors.password = 'Password is required'
    else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (!values.confirmPassword) errors.confirmPassword = 'Confirm password is required'
    else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match'
    return errors
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (submitted) {
      setValidation(validate({ ...form, [name]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate(form)
    setValidation(errors)
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      navigate(PATHS.login)
    } catch (err) {
      setValidation((prev) => ({ ...prev, submit: err?.message || 'Registration failed' }))
    }
  }

  return (
    <PageShell title="Sign Up" description="Create your STREAMORA account.">
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-lg sm:px-8 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {validation.submit || error?.message ? (
            <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300">
              {validation.submit || error?.message}
            </p>
          ) : null}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-200">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              placeholder="John Doe"
            />
            {validation.fullName ? <p className="mt-1 text-xs text-red-400">{validation.fullName}</p> : null}
          </div>

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
                autoComplete="new-password"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 pr-10 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                placeholder="Minimum 8 characters"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-200">
              Confirm Password
            </label>
            <div className="relative mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 pr-10 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {validation.confirmPassword ? <p className="mt-1 text-xs text-red-400">{validation.confirmPassword}</p> : null}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <Link to={PATHS.login} className="font-medium text-brand-400 hover:text-brand-300">
              Login
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}

export default Register

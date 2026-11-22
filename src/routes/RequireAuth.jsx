import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { isDeactivatedUser } from '../utils/roles.js'
import { PATHS } from './paths.js'

function RequireAuth({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuthSession()
  const location = useLocation()
  const from = `${location.pathname}${location.search}${location.hash}`

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="text-sm text-neutral-500">Loading…</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.login} replace state={{ from }} />
  }

  if (isDeactivatedUser(user)) {
    logout()
    return (
      <Navigate
        to={PATHS.login}
        replace
        state={{ from, message: 'Your account has been deactivated.' }}
      />
    )
  }

  return children
}

export default RequireAuth

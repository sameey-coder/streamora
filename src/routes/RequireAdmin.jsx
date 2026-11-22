import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { isAdminUser, isDeactivatedUser } from '../utils/roles.js'
import { PATHS } from './paths.js'

function RequireAdmin({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuthSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="text-sm text-neutral-500">Loading…</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={PATHS.adminLogin}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (isDeactivatedUser(user)) {
    logout()
    return (
      <Navigate
        to={PATHS.login}
        replace
        state={{ from: location.pathname, message: 'Your account has been deactivated.' }}
      />
    )
  }

  if (!isAdminUser(user)) {
    return <Navigate to={PATHS.home} replace />
  }

  return children
}

export default RequireAdmin

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext, SESSION_STORAGE_KEY, readStoredUsers } from './authContext.js'
import { AUTH_STORAGE_KEY, updateStoredUserName, findStoredUserById } from '../utils/auth.js'
import { isDeactivatedUser, resolveRoleForEmail } from '../utils/roles.js'

function readSessionUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    return session?.user ?? null
  } catch {
    return null
  }
}

function getInitialSessionUser() {
  if (typeof window === 'undefined') return null
  const sessionUser = readSessionUser()
  if (!sessionUser) return null
  const current = findStoredUserById(sessionUser.id) || sessionUser
  if (isDeactivatedUser(current)) {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {
      // ignore
    }
    return null
  }
  return { ...sessionUser, status: current.status ?? sessionUser.status }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialSessionUser)
  const [loading] = useState(false)

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const revalidate = () => {
      const sessionUser = readSessionUser()
      if (!sessionUser) return
      if (isDeactivatedUser(findStoredUserById(sessionUser.id))) logout()
    }

    const handleStorage = (event) => {
      if (event.key === null || event.key === AUTH_STORAGE_KEY) revalidate()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [logout])

  const login = ({ email, password }) => {
    const users = readStoredUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const found = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password,
    )
    if (!found) {
      const error = new Error('Invalid email or password')
      error.code = 'INVALID_CREDENTIALS'
      throw error
    }
    if (isDeactivatedUser(found)) {
      const error = new Error('This account has been deactivated. Please contact support.')
      error.code = 'ACCOUNT_DEACTIVATED'
      throw error
    }
    const sessionUser = {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      role: found.role ?? resolveRoleForEmail(found.email),
      status: found.status ?? 'active',
    }
    setUser(sessionUser)
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: sessionUser }))
    } catch {
      // ignore
    }
    return sessionUser
  }

  const updateProfile = useCallback(
    ({ fullName }) => {
      if (!user) return null
      const updated = updateStoredUserName(user.id, fullName)
      const sessionUser = { ...user, fullName: updated?.fullName ?? fullName.trim(), status: updated?.status ?? user.status }
      setUser(sessionUser)
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: sessionUser }))
      } catch {
        // ignore
      }
      return sessionUser
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, login, logout, updateProfile, isAuthenticated: !!user, loading }),
    [user, loading, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
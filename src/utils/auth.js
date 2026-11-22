import { resolveRoleForEmail } from './roles.js'

export const AUTH_STORAGE_KEY = 'streamora:auth'

export const ACCOUNT_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
}

export function normalizeStatus(status) {
  if (status === ACCOUNT_STATUS.deactivated) return ACCOUNT_STATUS.deactivated
  return ACCOUNT_STATUS.active
}

export function readStoredUsers() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function writeStoredUsers(users) {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users))
    return true
  } catch {
    return false
  }
}

export function findStoredUserById(id) {
  return readStoredUsers().find((user) => user.id === id) || null
}

export function updateStoredUserName(id, fullName) {
  const trimmed = fullName.trim()
  let updated = null

  const users = readStoredUsers().map((user) => {
    if (user.id !== id) return user
    updated = { ...user, fullName: trimmed }
    return updated
  })

  writeStoredUsers(users)
  return updated
}

export function setStoredUserStatus(id, status) {
  const normalized = normalizeStatus(status)
  let updated = null
  const users = readStoredUsers().map((user) => {
    if (user.id !== id) return user
    updated = { ...user, status: normalized }
    return updated
  })
  writeStoredUsers(users)
  return updated
}

export function registerUser({ fullName, email, password }) {
  const users = readStoredUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const exists = users.some((user) => user.email.toLowerCase() === normalizedEmail)
  if (exists) {
    const error = new Error('An account with this email already exists')
    error.code = 'EMAIL_EXISTS'
    throw error
  }
  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: resolveRoleForEmail(normalizedEmail),
    status: ACCOUNT_STATUS.active,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  writeStoredUsers(users)
  return newUser
}
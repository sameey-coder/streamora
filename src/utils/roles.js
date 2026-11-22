// STREAMORA demo-only role system.
//
// This is NOT real authorization. The role lives in the same client-side
// storage as the rest of the account data and can be changed from the browser.
// It exists only to demonstrate an admin/regular-user distinction in this
// frontend certificate project.
//
// How the demo admin is configured:
//   - Any account registered with an email listed in DEMO_ADMIN_EMAILS is
//     given the "admin" role at registration time (and at login for accounts
//     created before this feature existed).
//   - The default demo admin email is "admin@streamora.com".
//   - Every other account is a regular "user".
//
// To use it: Sign Up with admin@streamora.com, then open /admin. There is no
// server-side check, so this must never be treated as production security.

export const DEMO_ADMIN_EMAILS = ['admin@streamora.com']

export const ROLES = {
  user: 'user',
  admin: 'admin',
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function resolveRoleForEmail(email) {
  return DEMO_ADMIN_EMAILS.includes(normalizeEmail(email)) ? ROLES.admin : ROLES.user
}

export function isAdminUser(user) {
  if (!user) return false
  const role = user.role === ROLES.admin ? ROLES.admin : null
  if (role) return true
  return DEMO_ADMIN_EMAILS.includes(normalizeEmail(user.email))
}

export function isDeactivatedUser(user) {
  if (!user) return false
  return user.status === 'deactivated'
}

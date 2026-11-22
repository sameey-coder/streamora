import { PATHS } from './paths.js'

export const PRIMARY_LINKS = [
  { to: PATHS.home, label: 'Home', end: true },
  { to: PATHS.browse, label: 'Browse Movies' },
  { to: PATHS.favourites, label: 'Favourites' },
  { to: PATHS.history, label: 'Watch History' },
  { to: PATHS.subscription, label: 'Subscription Plans' },
]

export const AUTH_LINKS = [
  { to: PATHS.login, label: 'Log In' },
  { to: PATHS.register, label: 'Sign Up' },
]

export const ACCOUNT_LINKS = [
  { to: PATHS.profile, label: 'Profile' },
  ...AUTH_LINKS,
]

export const LEGAL_LINKS = [
  { to: PATHS.privacy, label: 'Privacy Policy' },
  { to: PATHS.terms, label: 'Terms of Service' },
  { to: PATHS.cookie, label: 'Cookie Policy' },
]

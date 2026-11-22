import { createContext } from 'react'

export const SUBSCRIPTION_STORAGE_KEY = 'streamora:subscription'

export const SubscriptionContext = createContext(null)

export function isVerifiedSubscription(plan) {
  if (!plan || typeof plan !== 'object') return false
  return (
    plan.status === 'active' &&
    Boolean(plan.verifiedAt) &&
    Boolean(plan.tx_ref || plan.transaction_id) &&
    (plan.planId === 'standard' || plan.planId === 'premium')
  )
}

export function readStoredSubscription() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isVerifiedSubscription(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeStoredSubscription(plan) {
  if (!isVerifiedSubscription(plan)) return false
  try {
    window.localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(plan))
    return true
  } catch {
    return false
  }
}

export function clearStoredSubscription() {
  try {
    window.localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

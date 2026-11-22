import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthSession } from '../hooks/useAuthSession.js'
import {
  SubscriptionContext,
  clearStoredSubscription,
  isVerifiedSubscription,
  readStoredSubscription,
  writeStoredSubscription,
} from './subscriptionContext.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated } = useAuthSession()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loadedKey, setLoadedKey] = useState(null)

  const userId = user?.id ? String(user.id) : null
  const subscriptionKey = isAuthenticated && userId ? userId : 'anonymous'
  const loading = loadedKey !== subscriptionKey

  const refreshSubscription = useCallback(async () => {
    const key = subscriptionKey
    if (typeof window === 'undefined') {
      setSelectedPlan(null)
      setLoadedKey(key)
      return null
    }

    if (!isAuthenticated || !userId) {
      clearStoredSubscription()
      setSelectedPlan(null)
      setLoadedKey(key)
      return null
    }

    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/status?userId=${encodeURIComponent(userId)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        clearStoredSubscription()
        setSelectedPlan(null)
        return null
      }

      const sub = data.subscription
      if (isVerifiedSubscription(sub)) {
        writeStoredSubscription(sub)
        setSelectedPlan(sub)
        return sub
      }

      clearStoredSubscription()
      setSelectedPlan(null)
      return null
    } catch {
      const local = readStoredSubscription()
      if (local && String(local.userId ?? '') === userId) {
        setSelectedPlan(local)
        return local
      }
      clearStoredSubscription()
      setSelectedPlan(null)
      return null
    } finally {
      setLoadedKey(key)
    }
  }, [isAuthenticated, subscriptionKey, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: load/sync subscription when auth/user changes
    void refreshSubscription()
  }, [refreshSubscription])

  const selectPlan = useCallback((plan) => {
    if (!isVerifiedSubscription(plan)) return false
    if (userId && String(plan.userId ?? '') !== userId) return false
    if (!writeStoredSubscription(plan)) return false
    setSelectedPlan(plan)
    return true
  }, [userId])

  const clearPlan = useCallback(() => {
    setSelectedPlan(null)
    clearStoredSubscription()
  }, [])

  const value = useMemo(
    () => ({ selectedPlan, selectPlan, clearPlan, loading, refreshSubscription }),
    [selectedPlan, selectPlan, clearPlan, loading, refreshSubscription],
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

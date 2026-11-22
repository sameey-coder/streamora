import { useContext } from 'react'
import { SubscriptionContext } from '../context/subscriptionContext.js'

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
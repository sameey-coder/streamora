import { useContext } from 'react'
import { WatchHistoryContext } from '../context/watchHistoryContext.js'

export function useWatchHistory() {
  const ctx = useContext(WatchHistoryContext)
  if (!ctx) throw new Error('useWatchHistory must be used within WatchHistoryProvider')
  return ctx
}

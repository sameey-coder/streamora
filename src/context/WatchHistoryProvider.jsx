import { useCallback, useMemo, useState } from 'react'
import { useAuthSession } from '../hooks/useAuthSession.js'
import {
  WatchHistoryContext,
  readStoredWatchHistory,
  toWatchHistoryMovie,
  writeStoredWatchHistory,
} from './watchHistoryContext.js'

export function WatchHistoryProvider({ children }) {
  const { user, isAuthenticated } = useAuthSession()
  const userId = user?.id ? String(user.id) : null
  const [historyByUserId, setHistoryByUserId] = useState({})

  const history = useMemo(() => {
    if (!isAuthenticated || !userId) return []
    return historyByUserId[userId] ?? readStoredWatchHistory(userId)
  }, [historyByUserId, isAuthenticated, userId])

  const addToHistory = useCallback((movie) => {
    if (!userId) return false
    const normalized = toWatchHistoryMovie(movie)
    if (!normalized) return false
    const watchedAt = new Date().toISOString()
    let ok = false
    setHistoryByUserId((prev) => {
      const current = prev[userId] ?? readStoredWatchHistory(userId)
      const next = [{ ...normalized, watchedAt }, ...current.filter((item) => item.id !== normalized.id)]
      ok = writeStoredWatchHistory(userId, next)
      return ok ? { ...prev, [userId]: next } : prev
    })
    return ok
  }, [userId])

  const clearHistory = useCallback(() => {
    if (!userId) return
    writeStoredWatchHistory(userId, [])
    setHistoryByUserId((prev) => ({ ...prev, [userId]: [] }))
  }, [userId])

  const value = useMemo(() => ({
    history,
    count: history.length,
    addToHistory,
    clearHistory,
  }), [history, addToHistory, clearHistory])

  return <WatchHistoryContext.Provider value={value}>{children}</WatchHistoryContext.Provider>
}

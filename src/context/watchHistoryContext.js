import { createContext } from 'react'

export const WATCH_HISTORY_STORAGE_KEY = 'streamora:watchHistory'

export const WatchHistoryContext = createContext(null)

export function toWatchHistoryMovie(movie) {
  const id = Number(movie?.id)
  if (!Number.isFinite(id) || id <= 0) return null
  return {
    id,
    title: movie.title || movie.original_title || 'Untitled',
    original_title: movie.original_title ?? null,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
    release_date: movie.release_date ?? null,
    vote_average: Number(movie.vote_average) || 0,
    vote_count: Number(movie.vote_count) || 0,
  }
}

export function readStoredWatchHistory(userId) {
  if (typeof window === 'undefined' || !userId) return []
  try {
    const raw = window.localStorage.getItem(`${WATCH_HISTORY_STORAGE_KEY}:${String(userId)}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const seen = new Set()
    return parsed.reduce((items, entry) => {
      const movie = toWatchHistoryMovie(entry)
      const watchedAt = typeof entry?.watchedAt === 'string' ? entry.watchedAt : null
      if (!movie || !watchedAt || seen.has(movie.id)) return items
      seen.add(movie.id)
      items.push({ ...movie, watchedAt })
      return items
    }, [])
  } catch {
    return []
  }
}

export function writeStoredWatchHistory(userId, items) {
  if (!userId) return false
  try {
    window.localStorage.setItem(`${WATCH_HISTORY_STORAGE_KEY}:${String(userId)}`, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

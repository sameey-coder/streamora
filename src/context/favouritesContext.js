import { createContext } from 'react'

export const FAVOURITES_STORAGE_KEY = 'streamora:favourites'
export const LEGACY_FAVOURITES_MIGRATION_KEY = 'streamora:favourites:migrated'

export const FavouritesContext = createContext(null)

export function toFavouriteMovie(movie) {
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

export function getFavouritesStorageKey(userId) {
  if (userId == null || userId === '') return null
  return `${FAVOURITES_STORAGE_KEY}:${String(userId)}`
}

export function normalizeFavourites(parsed) {
  if (!Array.isArray(parsed)) return []
  const seen = new Set()
  return parsed.reduce((movies, entry) => {
    const movie = toFavouriteMovie(entry)
    if (!movie || seen.has(movie.id)) return movies
    seen.add(movie.id)
    movies.push(movie)
    return movies
  }, [])
}

export function readStoredFavourites(userId) {
  if (typeof window === 'undefined') return []
  const key = getFavouritesStorageKey(userId)
  if (!key) return []

  try {
    const raw = window.localStorage.getItem(key)
    if (raw) return normalizeFavourites(JSON.parse(raw))

    // Safe one-time migration: if legacy global favourites exist and this user
    // has no scoped favourites yet, copy them to the current user. Keep legacy
    // key so data is not destroyed.
    const migrated = window.localStorage.getItem(LEGACY_FAVOURITES_MIGRATION_KEY)
    const legacyRaw = window.localStorage.getItem(FAVOURITES_STORAGE_KEY)
    if (!migrated && legacyRaw) {
      const legacy = normalizeFavourites(JSON.parse(legacyRaw))
      if (legacy.length > 0) {
        window.localStorage.setItem(key, JSON.stringify(legacy))
        window.localStorage.setItem(LEGACY_FAVOURITES_MIGRATION_KEY, String(userId))
        return legacy
      }
    }

    return []
  } catch {
    return []
  }
}

export function writeStoredFavourites(userId, favourites) {
  if (typeof window === 'undefined') return false
  const key = getFavouritesStorageKey(userId)
  if (!key) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(normalizeFavourites(favourites)))
    return true
  } catch {
    return false
  }
}

import { createContext } from 'react'

// STREAMORA demo-only "content management" store.
//
// This holds the admin's curated Home content (featured movies + promotional
// banner text) in the browser's localStorage. TMDB stays the source of the
// catalogue: we only persist a small snapshot of the handful of movies the
// admin explicitly selected, never the full catalogue.

export const CONTENT_STORAGE_KEY = 'streamora:content'

export const ContentContext = createContext(null)

export const DEFAULT_EYEBROW = 'Featured this week'
export const PROMO_MAX_LENGTH = 80

export function toFeaturedMovie(movie) {
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
    overview: typeof movie.overview === 'string' ? movie.overview : '',
    popularity: Number(movie.popularity) || 0,
  }
}

export function normalizeContent(raw) {
  const seen = new Set()
  const featured = []

  if (Array.isArray(raw?.featured)) {
    for (const entry of raw.featured) {
      const movie = toFeaturedMovie(entry)
      if (!movie || seen.has(movie.id)) continue
      seen.add(movie.id)
      featured.push(movie)
    }
  }

  const requestedHeroId = Number(raw?.heroId)
  const heroId = featured.some((movie) => movie.id === requestedHeroId)
    ? requestedHeroId
    : featured[0]?.id ?? null

  const promoRaw = raw?.promo ?? {}

  return {
    featured,
    heroId,
    promo: {
      enabled: Boolean(promoRaw.enabled),
      text: typeof promoRaw.text === 'string' ? promoRaw.text.slice(0, PROMO_MAX_LENGTH) : '',
    },
  }
}

export function readStoredContent() {
  if (typeof window === 'undefined') return normalizeContent(null)
  try {
    const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY)
    if (!raw) return normalizeContent(null)
    return normalizeContent(JSON.parse(raw))
  } catch {
    return normalizeContent(null)
  }
}

export function writeStoredContent(content) {
  try {
    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content))
    return true
  } catch {
    return false
  }
}

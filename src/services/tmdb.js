// TMDB API service - https://developer.themoviedb.org/docs/getting-started
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

const DEFAULT_TTL_MS = 60_000
const MAX_CACHE_ENTRIES = 60

export const MISSING_API_KEY_MESSAGE =
  'TMDB API key is missing. Add VITE_TMDB_API_KEY to your .env file and restart the dev server.'

export { TMDB_BASE_URL, TMDB_IMAGE_BASE_URL }

const responseCache = new Map()
const inFlightRequests = new Map()

export function tmdbImageUrl(path, size = 'w500') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`
}

function createAbortError() {
  return new DOMException('The request was aborted.', 'AbortError')
}

export function isAbortError(error) {
  return error?.name === 'AbortError'
}

export function tmdbUrl(endpoint, params = {}) {
  if (!TMDB_API_KEY) return null

  const url = new URL(`${TMDB_BASE_URL}/${endpoint.replace(/^\/+/, '')}`)

  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  for (const [key, value] of entries) {
    url.searchParams.set(key, String(value))
  }

  url.searchParams.set('api_key', TMDB_API_KEY)

  return url.toString()
}

function pruneCache() {
  if (responseCache.size <= MAX_CACHE_ENTRIES) return

  const now = Date.now()
  for (const [url, entry] of responseCache) {
    if (entry.expiresAt <= now) {
      responseCache.delete(url)
    }
  }
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.status_message || response.statusText
    throw new Error(`TMDB request failed (${response.status}): ${message}`)
  }

  return response.json()
}

function shareRequest(url, ttl) {
  const cached = responseCache.get(url)

  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data)
  }

  let pending = inFlightRequests.get(url)

  if (!pending) {
    pending = fetchJson(url)
    inFlightRequests.set(url, pending)

    pending.then(
      (data) => {
        responseCache.set(url, { data, expiresAt: Date.now() + ttl })
        pruneCache()
      },
      () => {},
    )

    const release = () => inFlightRequests.delete(url)
    pending.then(release, release)
  }

  return pending
}

function withAbort(promise, signal) {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(createAbortError())

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(createAbortError())
    signal.addEventListener('abort', onAbort, { once: true })

    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (error) => {
        signal.removeEventListener('abort', onAbort)
        reject(error)
      },
    )
  })
}

export async function tmdbRequest(endpoint, params = {}, options = {}) {
  const { signal, cache: useCache = true, ttl = DEFAULT_TTL_MS } = options

  if (!TMDB_API_KEY) {
    throw new Error(MISSING_API_KEY_MESSAGE)
  }

  const url = tmdbUrl(endpoint, params)

  return withAbort(useCache ? shareRequest(url, ttl) : fetchJson(url), signal)
}

export function clearTmdbCache() {
  responseCache.clear()
}
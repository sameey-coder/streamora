import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  isAbortError,
  MISSING_API_KEY_MESSAGE,
  tmdbRequest,
  tmdbUrl,
} from '../services/tmdb.js'

const INITIAL_STATE = { key: null, data: null, error: null }
const MISSING_KEY_ERROR = new Error(MISSING_API_KEY_MESSAGE)

function normaliseParams(params) {
  return Object.fromEntries(
    Object.keys(params)
      .sort()
      .filter(
        (key) => params[key] !== undefined && params[key] !== null && params[key] !== '',
      )
      .map((key) => [key, params[key]]),
  )
}

function toResults(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.genres)) return data.genres
  return null
}

export function useTmdbMovies(endpoint, params = {}, options = {}) {
  const { cache: useCache = true, ttl } = options

  const paramsKey = JSON.stringify(normaliseParams(params))
  const url = useMemo(() => tmdbUrl(endpoint, JSON.parse(paramsKey)), [endpoint, paramsKey])
  const hasUrl = url !== null
  const key = url ?? `missing-key:${endpoint}`

  const [state, setState] = useState(INITIAL_STATE)
  const [nonce, setNonce] = useState(0)

  const refetch = useCallback(() => {
    setState((previous) => ({ key: null, data: previous.data, error: null }))
    setNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!hasUrl) return

    const controller = new AbortController()
    let active = true

    tmdbRequest(endpoint, JSON.parse(paramsKey), {
      signal: controller.signal,
      cache: useCache,
      ttl,
    })
      .then((data) => {
        if (active) setState({ key, data, error: null })
      })
      .catch((error) => {
        if (active && !isAbortError(error)) setState({ key, data: null, error })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [endpoint, paramsKey, key, nonce, useCache, ttl, hasUrl])

  const isCurrent = state.key === key
  const data = isCurrent ? state.data : null

  return {
    data,
    movies: isCurrent ? toResults(data) : null,
    totalPages: isCurrent ? (data?.total_pages ?? null) : null,
    totalResults: isCurrent ? (data?.total_results ?? null) : null,
    loading: hasUrl ? !isCurrent : false,
    error: hasUrl ? (isCurrent ? state.error : null) : MISSING_KEY_ERROR,
    refetch,
  }
}
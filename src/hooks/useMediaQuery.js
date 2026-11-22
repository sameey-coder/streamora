import { useCallback, useSyncExternalStore } from 'react'

function subscribe(query, onStoreChange) {
  const mediaQuery = window.matchMedia(query)

  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

export function useMediaQuery(query) {
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    getSnapshot,
    () => false,
  )
}

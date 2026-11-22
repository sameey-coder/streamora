import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CONTENT_STORAGE_KEY,
  ContentContext,
  normalizeContent,
  readStoredContent,
  writeStoredContent,
} from './contentContext.js'

export function ContentProvider({ children }) {
  const [content, setContent] = useState(readStoredContent)

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== CONTENT_STORAGE_KEY) return
      setContent(readStoredContent())
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const saveContent = useCallback((next) => {
    const normalized = normalizeContent(next)
    setContent(normalized)
    return writeStoredContent(normalized)
  }, [])

  const heroMovie = useMemo(() => {
    if (content.featured.length === 0) return null
    return content.featured.find((movie) => movie.id === content.heroId) ?? content.featured[0]
  }, [content])

  const value = useMemo(
    () => ({
      featured: content.featured,
      heroId: content.heroId,
      promo: content.promo,
      heroMovie,
      saveContent,
    }),
    [content, heroMovie, saveContent],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthSession } from '../hooks/useAuthSession.js'
import {
  FavouritesContext,
  getFavouritesStorageKey,
  readStoredFavourites,
  toFavouriteMovie,
  writeStoredFavourites,
} from './favouritesContext.js'

function FavouritesProvider({ children }) {
  const { user, isAuthenticated } = useAuthSession()
  const userId = user?.id ? String(user.id) : null
  const [favouritesByUserId, setFavouritesByUserId] = useState({})

  const favourites = useMemo(() => {
    if (!isAuthenticated || !userId) return []
    return favouritesByUserId[userId] ?? readStoredFavourites(userId)
  }, [favouritesByUserId, isAuthenticated, userId])

  useEffect(() => {
    function handleStorage(event) {
      const key = getFavouritesStorageKey(userId)
      if (!key || event.key !== key) return
      setFavouritesByUserId((prev) => ({ ...prev, [userId]: readStoredFavourites(userId) }))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [userId])

  const favouriteIds = useMemo(
    () => new Set(favourites.map((movie) => movie.id)),
    [favourites],
  )

  const isFavourite = useCallback((id) => favouriteIds.has(Number(id)), [favouriteIds])

  const updateFavourites = useCallback((updater) => {
    if (!userId) return
    setFavouritesByUserId((prev) => {
      const current = prev[userId] ?? readStoredFavourites(userId)
      const next = updater(current)
      if (next === current) return prev
      writeStoredFavourites(userId, next)
      return { ...prev, [userId]: next }
    })
  }, [userId])

  const addFavourite = useCallback((movie) => {
    if (!userId) return
    const next = toFavouriteMovie(movie)
    if (!next) return
    updateFavourites((current) => (current.some((item) => item.id === next.id) ? current : [next, ...current]))
  }, [userId, updateFavourites])

  const removeFavourite = useCallback((id) => {
    if (!userId) return
    const targetId = Number(id)
    updateFavourites((current) => {
      if (!current.some((item) => item.id === targetId)) return current
      return current.filter((item) => item.id !== targetId)
    })
  }, [userId, updateFavourites])

  const toggleFavourite = useCallback((movie) => {
    if (!userId) return
    const next = toFavouriteMovie(movie)
    if (!next) return
    updateFavourites((current) =>
      current.some((item) => item.id === next.id)
        ? current.filter((item) => item.id !== next.id)
        : [next, ...current],
    )
  }, [userId, updateFavourites])

  const clearFavourites = useCallback(() => {
    if (!userId) return
    writeStoredFavourites(userId, [])
    setFavouritesByUserId((prev) => ({ ...prev, [userId]: [] }))
  }, [userId])

  const value = useMemo(
    () => ({
      favourites,
      favouriteIds,
      count: favourites.length,
      isFavourite,
      addFavourite,
      removeFavourite,
      toggleFavourite,
      clearFavourites,
    }),
    [favourites, favouriteIds, isFavourite, addFavourite, removeFavourite, toggleFavourite, clearFavourites],
  )

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
}

export default FavouritesProvider

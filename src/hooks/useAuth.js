import { useCallback, useState } from 'react'
import { registerUser } from '../utils/auth.js'

export function useAuth() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const register = useCallback(async (data) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const user = registerUser(data)
      return user
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { register, isSubmitting, error }
}
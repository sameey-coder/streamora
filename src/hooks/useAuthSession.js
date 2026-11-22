import { useContext } from 'react'
import { AuthContext } from '../context/authContext.js'

export function useAuthSession() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthSession must be used within AuthProvider')
  return ctx
}
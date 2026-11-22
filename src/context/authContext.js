import { createContext } from 'react'
import { readStoredUsers } from '../utils/auth.js'

export const SESSION_STORAGE_KEY = 'streamora:session'
export const AuthContext = createContext(null)
export { readStoredUsers }
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import api from '../services/api'

interface AuthContextValue {
  token: string | null
  userId: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const getUserIdFromToken = (token: string): string => {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.userId as string
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [userId, setUserId] = useState<string | null>(() => {
    const stored = localStorage.getItem('token')
    return stored ? getUserIdFromToken(stored) : null
  })

  const persist = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUserId(getUserIdFromToken(newToken))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
    persist(data.token)
  }, [persist])

  const register = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/auth/register', { email, password })
    persist(data.token)
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUserId(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, userId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

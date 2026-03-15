import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api'

import type { User } from '../types'

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  ready: boolean
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const restoreSession = useCallback(async () => {
    const t = localStorage.getItem('token')
    if (!t) {
      setReady(true)
      return
    }
    try {
      const { data } = await api.get<User>('/api/auth/me')
      setUser(data)
      setToken(t)
    } catch {
      logout()
    } finally {
      setReady(true)
    }
  }, [logout])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    const onLogout = () => logout()
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post<{ user: User; token: string }>('/api/auth/login', { email, password })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true)
    try {
      const { data } = await api.post<{ user: User; token: string }>('/api/auth/register', { email, password, name })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    } finally {
      setLoading(false)
    }
  }, [])

  const value: AuthContextValue = {
    user,
    token,
    loading,
    ready,
    login,
    register,
    logout,
    restoreSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
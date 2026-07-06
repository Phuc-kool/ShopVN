import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const data = res.data

    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify({
      id:       data.userId,
      email:    data.email,
      fullName: data.fullName,
      role:     data.role,
    }))

    setUser({ id: data.userId, email: data.email, fullName: data.fullName, role: data.role })

    return data.role
  }, [])

  const register = useCallback(async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password })
    const data = res.data

    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify({
      id: data.userId, email: data.email, fullName: data.fullName, role: data.role,
    }))

    setUser({ id: data.userId, email: data.email, fullName: data.fullName, role: data.role })
    return data.role
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'ADMIN'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

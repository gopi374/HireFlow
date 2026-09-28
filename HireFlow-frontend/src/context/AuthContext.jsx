import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getLoginUser } from '../components/API/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('token') || localStorage.getItem('accessToken'))
  })

  const location = useLocation()
  const navigate = useNavigate()

  // Fetch / verify logged-in user from backend
  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    if (!token) {
      setUser(null)
      setProfile(null)
      setIsAuthenticated(false)
      setLoading(false)
      return null
    }

    try {
      const data = await getLoginUser(token)
      if (data?.user) {
        setUser(data.user)
        setProfile(data.profile || null)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(data.user))
        return data.user
      } else {
        throw new Error('User data missing')
      }
    } catch (err) {
      console.warn('Session check note:', err?.message || err)
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      setProfile(null)
      setIsAuthenticated(false)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Verify / fetch logged-in user on initial mount and whenever URL changes
  useEffect(() => {
    verifyUser()
  }, [location.pathname, verifyUser])

  // Login handler
  const login = (data) => {
    if (data.token) localStorage.setItem('token', data.token)
    if (data.tokens?.accessToken) {
      localStorage.setItem('accessToken', data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.tokens.refreshToken)
    }
    if (data.user) {
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      setIsAuthenticated(true)
    }
    if (data.profile) {
      setProfile(data.profile)
    }
  }

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setProfile(null)
    setIsAuthenticated(false)
    navigate('/login')
  }

  const role = user?.role ? String(user.role).toUpperCase() : null

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAuthenticated,
        verifyUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

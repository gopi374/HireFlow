import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const GuestRoute = () => {
  const { user, role, isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (isAuthenticated && user) {
    if (role === 'RECRUITER' || role === 'ADMIN') {
      return <Navigate to="/recruiter/dash" replace />
    }
    return <Navigate to="/candidate/dash" replace />
  }

  return <Outlet />
}

export default GuestRoute

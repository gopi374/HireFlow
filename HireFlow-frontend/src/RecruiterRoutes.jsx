import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Loader2 } from 'lucide-react'

const RecruiterRoutes = () => {
  const { user, role, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Verifying Recruiter Session</h3>
            <p className="text-xs text-slate-500 mt-1">Checking authentication and recruiter permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If logged in as Candidate -> redirect to candidate dashboard
  if (role === 'CANDIDATE') {
    return <Navigate to="/candidate/dash" replace />
  }

  // Recruiter or Admin role
  return <Outlet />
}

export default RecruiterRoutes
import React, { useState, useEffect } from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import { GitPullRequest, Loader2, Users, Search } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const PIPELINE_COLUMNS = [
  { key: 'APPLIED', label: 'Applied', color: 'border-blue-200 text-blue-800 bg-blue-50' },
  { key: 'SCREENING', label: 'Screening', color: 'border-amber-200 text-amber-800 bg-amber-50' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-emerald-200 text-emerald-800 bg-emerald-50' },
  { key: 'INTERVIEW', label: 'Interview', color: 'border-purple-200 text-purple-800 bg-purple-50' },
  { key: 'SELECTED', label: 'Selected / Offer', color: 'border-teal-200 text-teal-800 bg-teal-50' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-rose-200 text-rose-800 bg-rose-50' }
]

const ApplicationPipeline = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      // Fetch all applications accessible to recruiter
      const res = await fetch(`${API_URL}/api/v1/applications`, { headers })
      if (res.ok) {
        const data = await res.json()
        const appList = data.data || data.applications || (Array.isArray(data) ? data : [])
        setCandidates(appList)
      } else {
        const errData = await res.json().catch(() => ({}))
        setErrorMessage(errData.message || 'Failed to fetch candidate applications.')
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
      setErrorMessage('Network error while loading pipeline applications.')
    } finally {
      setLoading(false)
    }
  }

  const moveCandidateStage = async (appId, newStage) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      // Optimistic update
      setCandidates(prev =>
        prev.map(c => ((c._id || c.id) === appId ? { ...c, status: newStage } : c))
      )

      const res = await fetch(`${API_URL}/api/v1/applications/${appId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStage, reason: `Moved to ${newStage} by recruiter` })
      })

      if (!res.ok) {
        // Revert on failure
        fetchApplications()
      }
    } catch (err) {
      console.error('Failed to update candidate stage:', err)
      fetchApplications()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="recruiter" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Applicant Tracking System (ATS)</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Recruitment Application Pipeline
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage applicant status transitions across hiring stages.
                  </p>
                </div>

                <div className="w-full md:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search candidate name or role..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading applicant pipeline...</p>
              </div>
            ) : (
              /* Kanban Columns */
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
                {PIPELINE_COLUMNS.map(col => {
                  const columnCandidates = candidates.filter(c => {
                    const statusMatch = (c.status || 'APPLIED').toUpperCase() === col.key
                    const candidateName = (c.candidate?.name || c.candidateName || '').toLowerCase()
                    const jobTitle = (c.job?.title || c.role || '').toLowerCase()
                    const searchLower = searchTerm.toLowerCase()
                    const searchMatch = !searchTerm || candidateName.includes(searchLower) || jobTitle.includes(searchLower)
                    return statusMatch && searchMatch
                  })

                  return (
                    <div key={col.key} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 min-w-[240px] flex flex-col justify-between">
                      <div>
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${col.color}`}>
                            {col.label}
                          </span>
                          <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {columnCandidates.length}
                          </span>
                        </div>

                        {/* Candidate Cards */}
                        {columnCandidates.length === 0 ? (
                          <div className="py-6 text-center text-slate-400">
                            <p className="text-[11px] italic">No applicants</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {columnCandidates.map(cand => {
                              const candId = cand._id || cand.id
                              const candName = cand.candidate?.name || cand.candidateName || 'Candidate'
                              const roleTitle = cand.job?.title || cand.role || 'Applied Role'
                              const appliedDate = cand.createdAt
                                ? new Date(cand.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Recent'

                              return (
                                <div
                                  key={candId}
                                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all space-y-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-900">{candName}</h4>
                                      <p className="text-[10px] text-blue-700 font-medium mt-0.5">{roleTitle}</p>
                                    </div>
                                  </div>

                                  {cand.candidate?.email && (
                                    <p className="text-[10px] text-slate-500 truncate">{cand.candidate.email}</p>
                                  )}

                                  {/* Move Stage Selector */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                                    <span className="text-[10px] text-slate-400">{appliedDate}</span>

                                    <select
                                      value={cand.status || 'APPLIED'}
                                      onChange={(e) => moveCandidateStage(candId, e.target.value)}
                                      className="bg-slate-50 border border-slate-200 text-[10px] text-blue-700 font-bold px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
                                    >
                                      {PIPELINE_COLUMNS.map(c => (
                                        <option key={c.key} value={c.key}>{c.label}</option>
                                      ))}
                                    </select>
                                  </div>

                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default ApplicationPipeline
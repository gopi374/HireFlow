import React, { useState, useEffect } from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import { SlidersHorizontal, Loader2, Briefcase } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ManageJobs = () => {
  const [positions, setPositions] = useState([])
  const [selectedPosId, setSelectedPosId] = useState('')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPositionsAndApps()
  }, [])

  const fetchPositionsAndApps = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const [jobsRes, appsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/jobs`, { headers }),
        fetch(`${API_URL}/api/v1/applications`, { headers })
      ])

      const jobsData = await jobsRes.json()
      const appsData = await appsRes.json()

      const fetchedJobs = jobsData.success ? (jobsData.data || jobsData.jobs || []) : (Array.isArray(jobsData) ? jobsData : [])
      const fetchedApps = appsData.success ? (appsData.data || appsData.applications || []) : (Array.isArray(appsData) ? appsData : [])

      setPositions(fetchedJobs)
      setApplications(fetchedApps)
      if (fetchedJobs.length > 0) {
        setSelectedPosId(fetchedJobs[0]._id || fetchedJobs[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch data for ManageJobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentPos = positions.find(p => (p._id || p.id) === selectedPosId) || positions[0]

  const updateStatus = async (newStatus) => {
    if (!currentPos) return
    const posId = currentPos._id || currentPos.id

    setPositions(prev =>
      prev.map(p => ((p._id || p.id) === posId ? { ...p, status: newStatus } : p))
    )

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${API_URL}/api/v1/jobs/${posId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (err) {
      console.error('Failed to update position status:', err)
    }
  }

  // Calculate metrics for selected job position
  const currentPosId = currentPos ? (currentPos._id || currentPos.id) : null
  const jobApps = applications.filter(a => {
    const jobRef = a.job?._id || a.job?.id || a.job
    return jobRef === currentPosId
  })

  const metrics = {
    applied: jobApps.length,
    screening: jobApps.filter(a => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW' || a.status === 'SCREENING').length,
    shortlisted: jobApps.filter(a => a.status === 'SHORTLISTED').length,
    interview: jobApps.filter(a => a.status === 'INTERVIEW_SCHEDULED' || a.status === 'INTERVIEWING').length,
    hired: jobApps.filter(a => a.status === 'ACCEPTED' || a.status === 'OFFERED' || a.status === 'HIRED').length
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="recruiter" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Position Control & Lifecycle</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Manage Job Positions
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Control hiring status transitions (Draft → Active → Closed → Archived).
                  </p>
                </div>

                {!loading && positions.length > 0 && (
                  <div className="w-full sm:w-64">
                    <select
                      value={selectedPosId}
                      onChange={(e) => setSelectedPosId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                    >
                      {positions.map(p => {
                        const id = p._id || p.id
                        return (
                          <option key={id} value={id}>{p.title}</option>
                        )
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading positions data...</p>
              </div>
            ) : !currentPos ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-6">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Positions Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create a new job posting to manage its lifecycle and track candidate funnel metrics.
                </p>
              </div>
            ) : (
              /* Position Control Panel */
              <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-extrabold text-slate-900">{currentPos.title}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentPos.status === 'ACTIVE' || currentPos.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                        {currentPos.status || 'PUBLISHED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Department: {currentPos.department || currentPos.category || 'General'} • Location: {currentPos.location || 'Remote'} • Work Mode: {currentPos.workMode || 'Hybrid'}
                    </p>
                  </div>

                  {/* State Toggles */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 mr-1">Lifecycle State:</span>
                    {['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].map(st => (
                      <button
                        key={st}
                        onClick={() => updateStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${currentPos.status === st
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applicant Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Applied</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.applied}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-amber-600">Screening</p>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{metrics.screening}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-600">Shortlisted</p>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1">{metrics.shortlisted}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-purple-600">Interviewing</p>
                    <p className="text-2xl font-extrabold text-purple-700 mt-1">{metrics.interview}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-teal-600">Offers Extended</p>
                    <p className="text-2xl font-extrabold text-teal-700 mt-1">{metrics.hired}</p>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default ManageJobs
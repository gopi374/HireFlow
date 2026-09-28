import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  Building2,
  FileCheck,
  Video,
  ExternalLink,
  MessageSquare,
  Loader2,
  AlertCircle,
  XCircle,
  Briefcase
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const STAGES = [
  { id: 0, statusKey: 'APPLIED', label: 'Applied', icon: FileCheck },
  { id: 1, statusKey: 'SCREENING', label: 'Screening', icon: Clock },
  { id: 2, statusKey: 'SHORTLISTED', label: 'Shortlisted', icon: UserCheck },
  { id: 3, statusKey: 'INTERVIEW', label: 'Interview', icon: Video },
  { id: 4, statusKey: 'SELECTED', label: 'Offer / Selected', icon: CheckCircle2 }
]

const getStageIndex = (status) => {
  switch (status) {
    case 'APPLIED': return 0
    case 'SCREENING': return 1
    case 'SHORTLISTED': return 2
    case 'INTERVIEW': return 3
    case 'SELECTED': return 4
    default: return 0
  }
}

const TrackProcess = () => {
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [selectedAppId, setSelectedAppId] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchPipelineData()
  }, [])

  const fetchPipelineData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      // Fetch candidate applications & interviews in parallel
      const [appsRes, intsRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/users/me/applications`, { headers }),
        fetch(`${API_URL}/api/v1/users/me/interviews`, { headers })
      ])

      let appList = []
      if (appsRes.status === 'fulfilled' && appsRes.value.ok) {
        const appsData = await appsRes.value.json()
        appList = appsData.data || appsData.applications || (Array.isArray(appsData) ? appsData : [])
      }

      let intList = []
      if (intsRes.status === 'fulfilled' && intsRes.value.ok) {
        const intsData = await intsRes.value.json()
        intList = intsData.data || intsData.interviews || (Array.isArray(intsData) ? intsData : [])
      }

      setApplications(appList)
      setInterviews(intList)

      if (appList.length > 0) {
        setSelectedAppId(appList[0]._id || appList[0].id)
      }
    } catch (err) {
      console.error('Failed to load application pipeline tracking:', err)
      setErrorMessage('Could not load application tracking data.')
    } finally {
      setLoading(false)
    }
  }

  const currentApp = applications.find(a => (a._id || a.id) === selectedAppId) || applications[0]

  // Find matching interview for selected application
  const currentInterview = currentApp
    ? interviews.find(i => {
        const appId = currentApp._id || currentApp.id
        const jobId = currentApp.job?._id || currentApp.job?.id || currentApp.job
        const iAppId = typeof i.application === 'object' ? i.application?._id : i.application
        const iJobId = typeof i.job === 'object' ? i.job?._id : i.job
        return (iAppId && iAppId === appId) || (iJobId && iJobId === jobId)
      })
    : null

  const currentStageIndex = currentApp ? getStageIndex(currentApp.status) : 0
  const isRejected = currentApp?.status === 'REJECTED'
  const isWithdrawn = currentApp?.status === 'WITHDRAWN'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="candidate" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Recruitment Pipeline Tracker</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Application Process Tracker
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Follow step-by-step interview milestones and recruiter evaluation logs.
                  </p>
                </div>

                {applications.length > 0 && (
                  <div className="w-full md:w-72">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Select Active Application
                    </label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {applications.map(app => {
                        const appId = app._id || app.id
                        const roleTitle = app.job?.title || 'Role'
                        const companyName = app.job?.company?.name || app.job?.company || 'Company'
                        return (
                          <option key={appId} value={appId}>
                            {roleTitle} ({companyName})
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Current Role Banner */}
              {currentApp && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {currentApp.job?.title || 'Applied Position'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {currentApp.job?.company?.name || 'Company'}
                      </p>
                    </div>
                  </div>

                  {isRejected ? (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Status: Application Not Selected</span>
                    </div>
                  ) : isWithdrawn ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Status: Application Withdrawn</span>
                    </div>
                  ) : (
                    <div className="bg-purple-50 border border-purple-200 text-purple-800 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                      <span>Current Stage: {STAGES[currentStageIndex]?.label || currentApp.status}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading tracking progress...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No Active Applications</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You haven't submitted any job applications yet. Explore open job listings and submit your application to track your process.
                  </p>
                </div>
                <Link
                  to="/candidate/find"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Explore Job Opportunities
                </Link>
              </div>
            ) : (
              <>
                {/* Stepper */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider text-slate-500">
                    Pipeline Lifecycle Progress
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {STAGES.map((stage) => {
                      const Icon = stage.icon
                      const isPassed = stage.id <= currentStageIndex && !isRejected && !isWithdrawn
                      const isCurrent = stage.id === currentStageIndex && !isRejected && !isWithdrawn

                      return (
                        <div
                          key={stage.id}
                          className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm scale-105'
                              : isPassed
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-white border-slate-100 text-slate-400'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-xs font-bold ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-sm'
                                : isPassed
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold">{stage.label}</span>
                          <span className="text-[10px] mt-1 text-slate-500">
                            {isCurrent ? 'Active Now' : isPassed ? 'Completed' : 'Upcoming'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Details & Audit Log */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {currentInterview && (
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                        <Video className="w-4 h-4" />
                        <span>Scheduled Interview Details</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {currentInterview.type || 'Technical'} Interview ({currentInterview.mode || 'ONLINE'})
                      </h3>

                      <div className="space-y-3 text-xs text-slate-700">
                        <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Date & Time</p>
                            <p className="font-bold text-slate-900 mt-0.5">
                              {new Date(currentInterview.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Duration & Host</p>
                            <p className="font-bold text-slate-900 mt-0.5">
                              {currentInterview.durationMinutes || 45} mins • {
                                currentInterview.interviewers?.map(i => i.name).join(', ') || 'Hiring Team'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {currentInterview.meetingUrl && (
                        <a
                          href={currentInterview.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          Join Meeting Room <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className={`${currentInterview ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-slate-200 rounded-3xl p-6 shadow-sm`}>
                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Status Audit Log & History
                    </h3>

                    {currentApp?.statusHistory && currentApp.statusHistory.length > 0 ? (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {currentApp.statusHistory.map((item, idx) => {
                          const dateStr = item.changedAt
                            ? new Date(item.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'
                          const actorName = typeof item.changedBy === 'object' ? item.changedBy?.name : 'Recruitment Team'
                          return (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white flex items-center justify-center text-white">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>

                              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h4 className="text-xs font-bold text-slate-900">{item.status}</h4>
                                  <span className="text-[11px] text-slate-500 font-medium">{dateStr}</span>
                                </div>
                                <p className="text-[11px] text-blue-700 font-semibold">By {actorName || 'Hiring System'}</p>
                                {item.reason && (
                                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">{item.reason}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No status changes recorded yet.</p>
                    )}
                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default TrackProcess
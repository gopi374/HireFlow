import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  PlusCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  CheckCircle2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const RecruiterDashboard = () => {
  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (err) {
    user = {}
  }

  const recruiterName = user.name || 'Recruiter'
  const companyName = user.companyName || user.company?.name || 'Your Company'

  const [metrics, setMetrics] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    upcomingInterviewsCount: 0,
    companyVerified: true
  })

  const [recentApplicants, setRecentApplicants] = useState([])
  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const [jobsRes, appsRes, intsRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/jobs`, { headers }),
        fetch(`${API_URL}/api/v1/applications`, { headers }),
        fetch(`${API_URL}/api/v1/interviews`, { headers })
      ])

      let jobList = []
      if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
        const jobsData = await jobsRes.value.json().catch(() => ({}))
        jobList = jobsData.data || jobsData.jobs || (Array.isArray(jobsData) ? jobsData : [])
      }

      let appList = []
      if (appsRes.status === 'fulfilled' && appsRes.value.ok) {
        const appsData = await appsRes.value.json().catch(() => ({}))
        appList = appsData.data || appsData.applications || (Array.isArray(appsData) ? appsData : [])
      }

      let intList = []
      if (intsRes.status === 'fulfilled' && intsRes.value.ok) {
        const intsData = await intsRes.value.json().catch(() => ({}))
        intList = intsData.data || intsData.interviews || (Array.isArray(intsData) ? intsData : [])
      }

      const activeJobsCount = jobList.filter(j => j.status === 'PUBLISHED' || j.status === 'ACTIVE').length
      setRecentApplicants(appList.slice(0, 5))
      setUpcomingInterviews(intList.slice(0, 5))

      setMetrics({
        activeJobs: activeJobsCount,
        totalApplicants: appList.length,
        upcomingInterviewsCount: intList.length,
        companyVerified: true
      })
    } catch (err) {
      console.error('Failed to load recruiter dashboard metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="recruiter" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 shadow-md text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/30 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> {companyName}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                    Recruiter Command Center 🚀
                  </h1>
                  <p className="text-xs text-blue-100 mt-2 max-w-xl">
                    Welcome back, <span className="font-bold underline">{recruiterName}</span>. Review applicant pipelines, track open postings, and manage scheduled interviews.
                  </p>
                </div>

                <Link
                  to="/recruiter/create-jobs"
                  className="px-6 py-3.5 rounded-2xl bg-white text-blue-700 font-bold text-xs shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" /> Post New Position
                </Link>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Active Job Postings</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{loading ? '...' : metrics.activeJobs}</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Accepting applications</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Job Applicants</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{loading ? '...' : metrics.totalApplicants}</h3>
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">Across active pipelines</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Upcoming Interviews</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{loading ? '...' : metrics.upcomingInterviewsCount}</h3>
                  <p className="text-[11px] text-purple-600 font-semibold mt-1">Scheduled sessions</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Recent Applicants & Upcoming Interviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Recent Applicants */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Recent Candidates</h2>
                    <p className="text-xs text-slate-500">Latest applicants across open roles.</p>
                  </div>
                  <Link
                    to="/recruiter/applications"
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    View Pipeline <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-xs">Loading applicants...</p>
                  </div>
                ) : recentApplicants.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 italic text-xs">
                    No candidate applications submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentApplicants.map(app => {
                      const appId = app._id || app.id
                      const candidateName = app.candidate?.name || app.candidateName || 'Candidate'
                      const roleTitle = app.job?.title || app.role || 'Applied Position'
                      const appliedDate = app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Recent'

                      return (
                        <div key={appId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{candidateName}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{roleTitle} • Applied {appliedDate}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {app.status || 'APPLIED'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Interviews */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
                    <p className="text-xs text-slate-500">Scheduled candidate assessment calls.</p>
                  </div>
                  <Link
                    to="/recruiter/evaluate"
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    Evaluate <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-xs">Loading interviews...</p>
                  </div>
                ) : upcomingInterviews.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 italic text-xs">
                    No upcoming interview sessions scheduled.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingInterviews.map(item => {
                      const intId = item._id || item.id
                      const candidateName = item.candidate?.name || item.candidate || 'Candidate'
                      const roleTitle = item.job?.title || item.role || 'Position'
                      const dateStr = item.scheduledAt
                        ? new Date(item.scheduledAt).toLocaleString()
                        : item.time || 'Scheduled'

                      return (
                        <div key={intId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">{candidateName}</h4>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                              {item.type || 'Interview'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">{roleTitle} • {dateStr}</p>
                          {item.meetingUrl && (
                            <a
                              href={item.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Join Meeting Room <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default RecruiterDashboard
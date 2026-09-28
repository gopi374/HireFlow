import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import { 
  Briefcase, 
  Bookmark, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  GitPullRequest
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CandidateDashboard = () => {
  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (err) {
    user = {}
  }

  const candidateName = user.name || user.username || 'Candidate'

  const [stats, setStats] = useState({
    activeApplications: 0,
    savedJobs: 0,
    upcomingInterviews: 0,
    profileCompleteness: 60
  })

  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const [jobsRes, appsRes, interviewsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/v1/jobs`, { headers, timeout: 5000 }),
          axios.get(`${API_URL}/api/v1/users/me/applications`, { headers, timeout: 5000 }),
          axios.get(`${API_URL}/api/v1/users/me/interviews`, { headers, timeout: 5000 })
        ])

        let jobList = []
        if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
          jobList = Array.isArray(jobsRes.value.data)
            ? jobsRes.value.data
            : jobsRes.value.data.jobs || jobsRes.value.data.data || []
        }

        let appList = []
        if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
          appList = Array.isArray(appsRes.value.data)
            ? appsRes.value.data
            : appsRes.value.data.applications || appsRes.value.data.data || []
        }

        let interviewsList = []
        if (interviewsRes.status === 'fulfilled' && interviewsRes.value?.data) {
          interviewsList = Array.isArray(interviewsRes.value.data)
            ? interviewsRes.value.data
            : interviewsRes.value.data.data || interviewsRes.value.data.interviews || []
        } else {
          interviewsList = appList.filter(app => app.status === 'INTERVIEW_SCHEDULED' || app.status === 'INTERVIEWING' || app.interviewDate)
        }

        setRecentApplications(appList)
        setRecommendedJobs(jobList.slice(0, 4))
        setUpcomingInterviews(interviewsList)

        let completeness = 40
        if (user.name) completeness += 15
        if (user.email) completeness += 15
        if (user.phone || user.skills) completeness += 15
        if (appList.length > 0) completeness += 15

        setStats({
          activeApplications: appList.length,
          savedJobs: 0,
          upcomingInterviews: interviewsList.length,
          profileCompleteness: Math.min(completeness, 100)
        })
      } catch (err) {
        console.warn('Unable to load dynamic dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="candidate" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 shadow-lg text-white">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Candidate Workspace</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                    Welcome back, {candidateName}! 👋
                  </h1>
                  <p className="mt-2 text-indigo-100 text-sm max-w-xl leading-relaxed">
                    You have <span className="font-bold text-white">{stats.upcomingInterviews} upcoming interviews</span> scheduled. Explore open roles and track your recruitment status.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/candidate/find"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-slate-50 transition-transform active:scale-95"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Explore Jobs
                  </Link>
                  <Link
                    to="/candidate/profile"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-900/40 hover:bg-indigo-900/60 text-white font-semibold text-xs border border-white/30 backdrop-blur-md transition-all"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-100">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <span className="font-semibold">Profile Strength:</span>
                  <div className="flex-1 bg-black/20 rounded-full h-2.5 overflow-hidden border border-white/20">
                    <div 
                      className="bg-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.profileCompleteness}%` }}
                    />
                  </div>
                  <span className="font-bold text-white">{stats.profileCompleteness}%</span>
                </div>
                <Link to="/candidate/profile" className="text-amber-200 font-semibold hover:underline flex items-center gap-1">
                  Complete remaining sections <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Applications</span>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats.activeApplications}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">{stats.activeApplications} submitted</span>
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Upcoming Interviews</span>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats.upcomingInterviews}</p>
                <p className="text-xs text-amber-600 mt-1 font-semibold">
                  {stats.upcomingInterviews > 0 ? 'Upcoming meeting' : 'No interviews scheduled'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Saved Jobs</span>
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Bookmark className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats.savedJobs}</p>
                <p className="text-xs text-slate-500 mt-1">Bookmarked opportunities</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Profile Status</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats.profileCompleteness}%</p>
                <p className="text-xs text-emerald-600 mt-1 font-semibold">Candidate Profile Active</p>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 columns */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Upcoming Interviews Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
                        <p className="text-xs text-slate-500">Confirmed meeting sessions with recruiters</p>
                      </div>
                    </div>
                    <Link to="/candidate/track" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                      View Timeline
                    </Link>
                  </div>

                  {upcomingInterviews.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      No interviews scheduled currently.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingInterviews.map((interview, index) => {
                        const intId = interview._id || interview.id || index
                        const intJobTitle = interview.job?.title || interview.jobTitle || interview.title || 'Role Interview'
                        const intCompany = interview.job?.company?.name || interview.company || 'Hiring Company'
                        const intDate = interview.scheduledAt
                          ? new Date(interview.scheduledAt).toLocaleString()
                          : interview.date || 'Scheduled'
                        const intType = interview.type || interview.interviewType || 'Interview'
                        const intLink = interview.meetingLink || interview.link
                        return (
                        <div key={intId} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold mb-2">
                                {intType}
                              </span>
                              <h3 className="text-base font-bold text-slate-900">{intJobTitle}</h3>
                              <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {intCompany}
                              </p>
                            </div>

                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {intDate}
                              </span>
                              {intLink && (
                                <a
                                  href={intLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                                >
                                  Join Call <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Recommended Jobs */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Explore Open Roles</h2>
                      <p className="text-xs text-slate-500">Discover job opportunities published by recruiters</p>
                    </div>
                    <Link to="/candidate/find" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      See all jobs <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {recommendedJobs.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      No open job postings available at the moment.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendedJobs.map((job, index) => {
                        const jId = job._id || job.id || index
                        const jCompany = job.company?.name || job.companyName || (typeof job.company === 'string' ? job.company : 'Company')
                        const jSalary = typeof job.salary === 'object' && job.salary
                          ? (job.salary.min || job.salary.max ? `₹${(job.salary.min||0).toLocaleString()} - ₹${(job.salary.max||0).toLocaleString()}` : null)
                          : job.salary || null
                        return (
                        <div key={jId} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                                {job.title}
                              </h3>
                              <p className="text-xs font-semibold text-slate-600 mt-1">{jCompany}</p>
                              
                              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {job.location || 'Remote'}
                                </span>
                                {jSalary && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                      {jSalary}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="text-blue-600 font-semibold">{job.employmentType || job.type || job.workMode || 'Full-time'}</span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                              <Link
                                to="/candidate/find"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Sidebar Column */}
              <div className="space-y-8">
                
                {/* Recent Activity Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
                    <Link to="/candidate/apply" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                      All ({stats.activeApplications})
                    </Link>
                  </div>

                  {recentApplications.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      No applications submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentApplications.slice(0, 6).map((app, index) => {
                        const aId = app._id || app.id || index
                        const aTitle = app.job?.title || app.jobTitle || 'Application'
                        const aCompany = app.job?.company?.name || app.company || app.job?.companyName || 'Company'
                        return (
                        <div key={aId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{aTitle}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{aCompany}</p>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                              {app.status || 'APPLIED'}
                            </span>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Tools */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Quick Tools</h3>
                  <div className="space-y-3">
                    <Link
                      to="/candidate/resume"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900">Manage Resume</p>
                        <p className="text-[11px] text-slate-500">Upload PDF / Manage Documents</p>
                      </div>
                    </Link>

                    <Link
                      to="/candidate/track"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <GitPullRequest className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900">Pipeline Progress</p>
                        <p className="text-[11px] text-slate-500">View stages & feedback notes</p>
                      </div>
                    </Link>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default CandidateDashboard
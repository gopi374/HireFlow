import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  FileText,
  Building2,
  Calendar,
  Eye,
  Trash2,
  ChevronRight,
  MessageSquare,
  Info
} from 'lucide-react'

const API_URL = "https://hireflow-p9ty.onrender.com"

const ApplyJobs = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedAppModal, setSelectedAppModal] = useState(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        const response = await axios.get(`${API_URL}/api/v1/users/me/applications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 5000
        })

        const appList = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.applications || []

        setApplications(appList)
      } catch (err) {
        console.warn('API error fetching applications:', err)
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleWithdraw = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        await axios.post(`${API_URL}/api/v1/applications/${id}/withdraw`, {}, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      } catch (err) {
        console.warn('Withdraw error:', err)
      } finally {
        setApplications(prev => prev.filter(app => (app._id || app.id) !== id))
      }
    }
  }

  const filteredApplications = applications.filter(app => {
    const status = app.status || 'Applied'
    if (activeTab === 'All') return true
    if (activeTab === 'Active') return ['Applied', 'Screening', 'Shortlisted', 'Interview'].includes(status)
    if (activeTab === 'Interviews') return status === 'Interview'
    if (activeTab === 'Closed') return ['Selected', 'Rejected'].includes(status)
    return true
  })

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="candidate" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Top Header Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Application Tracker</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    My Submitted Applications
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Track recruitment stages, interview invitations, and status logs.
                  </p>
                </div>

                <Link
                  to="/candidate/find"
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm self-start sm:self-auto"
                >
                  Apply to More Jobs
                </Link>
              </div>

              {/* Status Tab Filters */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-100">
                {['All', 'Active', 'Interviews', 'Closed'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tab} ({
                      tab === 'All' ? applications.length :
                      tab === 'Active' ? applications.filter(a => ['Applied', 'Screening', 'Shortlisted', 'Interview'].includes(a.status || 'Applied')).length :
                      tab === 'Interviews' ? applications.filter(a => a.status === 'Interview').length :
                      applications.filter(a => ['Selected', 'Rejected'].includes(a.status)).length
                    })
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Cards List */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-xs font-semibold">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900">No applications found under "{activeTab}"</h3>
                <p className="text-xs text-slate-500">Search for open positions and submit your resume to start tracking.</p>
                <Link
                  to="/candidate/find"
                  className="inline-block mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app, index) => {
                  const appId = app._id || app.id || `app_${index}`
                  const status = app.status || 'Applied'
                  const title = app.job?.title || app.jobTitle || 'Job Position'
                  const company = app.job?.company?.name || app.company || app.job?.companyName || 'HireFlow Partner'
                  const location = app.job?.location || app.location || 'Remote'
                  const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : (app.appliedDate || 'Recently')

                  return (
                    <div
                      key={appId}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-blue-300 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{title}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-800 border-blue-200">
                                {status}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-600 mt-1">
                              {company} <span className="text-slate-400">•</span> {location}
                            </p>

                            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Applied on {appliedDate}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => setSelectedAppModal(app)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>

                          <Link
                            to="/candidate/track"
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            Track <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          {status !== 'Rejected' && (
                            <button
                              onClick={() => handleWithdraw(appId)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Withdraw Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Modal */}
            {selectedAppModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{selectedAppModal.jobTitle || selectedAppModal.job?.title}</h3>
                      <p className="text-xs text-slate-500">{selectedAppModal.company || selectedAppModal.job?.companyName}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-800 border-blue-200">
                      {selectedAppModal.status || 'Applied'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700">
                    {selectedAppModal.coverLetter && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Cover Letter</p>
                        <p className="text-slate-800 font-medium mt-1">{selectedAppModal.coverLetter}</p>
                      </div>
                    )}

                    {selectedAppModal.recruiterNote && (
                      <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-blue-800">
                        <p className="text-[10px] font-bold uppercase flex items-center gap-1 text-blue-700">
                          <MessageSquare className="w-3 h-3" /> Recruiter Feedback
                        </p>
                        <p className="mt-1">{selectedAppModal.recruiterNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSelectedAppModal(null)}
                      className="px-5 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Close Overview
                    </button>
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

export default ApplyJobs
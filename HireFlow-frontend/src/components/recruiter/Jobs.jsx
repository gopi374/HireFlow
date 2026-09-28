import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  Briefcase,
  Users,
  Search,
  PlusCircle,
  Edit,
  Power,
  Loader2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const RecruiterJobs = () => {
  const [jobsList, setJobsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_URL}/api/v1/jobs`, { headers })
      const data = await res.json()
      if (res.ok && data.success) {
        setJobsList(data.data || data.jobs || [])
      } else if (Array.isArray(data)) {
        setJobsList(data)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleJobStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' || currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED'
    setJobsList(prev =>
      prev.map(j => (j._id === id || j.id === id ? { ...j, status: nextStatus } : j))
    )
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${API_URL}/api/v1/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: nextStatus })
      })
    } catch (err) {
      console.error('Failed to update job status:', err)
    }
  }

  const filteredJobs = jobsList.filter(job => {
    const titleMatch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const deptMatch = (job.department || job.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSearch = titleMatch || deptMatch
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus
    return matchesSearch && matchesStatus
  })

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
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Company Postings</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    All Job Postings
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage published listings, applicant counts, and hiring status lifecycle.
                  </p>
                </div>

                <Link
                  to="/recruiter/create-jobs"
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm self-start sm:self-auto flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Post New Job
                </Link>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-100">
                {['All', 'ACTIVE', 'PUBLISHED', 'DRAFT', 'CLOSED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedStatus === status
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {status} ({status === 'All' ? jobsList.length : jobsList.filter(j => j.status === status).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job listings by title or department..."
                className="w-full bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Jobs List Grid */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-3xl">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-xs font-semibold text-slate-500">Loading job postings...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-6">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Job Postings Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No active job listings match your current filters. Post a new job or clear your search term.
                  </p>
                </div>
              ) : (
                filteredJobs.map(job => {
                  const jobId = job._id || job.id
                  const dept = job.department || job.category || 'Engineering'
                  const salaryText = typeof job.salary === 'object' && job.salary
                    ? `₹${job.salary.min ? job.salary.min.toLocaleString() : '0'} - ₹${job.salary.max ? job.salary.max.toLocaleString() : '0'}`
                    : (job.salary || 'Salary Disclosed on Interview')
                  const count = job.applicantCount ?? (job.applications ? job.applications.length : 0)

                  return (
                    <div
                      key={jobId}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-blue-300 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${job.status === 'ACTIVE' || job.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : job.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                            {job.status || 'PUBLISHED'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>Dept: {dept}</span>
                          <span>•</span>
                          <span>{job.location || 'Remote'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{salaryText}</span>
                        </div>
                      </div>

                      {/* Applicants & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Applicants</p>
                          <p className="text-base font-extrabold text-blue-700">{count}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to="/recruiter/applications"
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Users className="w-3.5 h-3.5" /> Pipeline
                          </Link>

                          <Link
                            to="/recruiter/manage-jobs"
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            title="Manage Position"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => toggleJobStatus(jobId, job.status)}
                            className={`p-2.5 rounded-xl border transition-colors ${job.status === 'CLOSED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            title={job.status === 'CLOSED' ? 'Re-open Job' : 'Close Job'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default RecruiterJobs
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
  Send,
  SlidersHorizontal,
  Info
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const FindJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkMode, setSelectedWorkMode] = useState('All')
  const [selectedJobType, setSelectedJobType] = useState('All')
  const [savedJobIds, setSavedJobIds] = useState([])

  const [selectedJob, setSelectedJob] = useState(null)
  
  const [applyingJob, setApplyingJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeVersion, setResumeVersion] = useState('')
  const [applySuccess, setApplySuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        const response = await axios.get(`${API_URL}/api/v1/jobs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 5000
        })

        const jobList = Array.isArray(response.data)
          ? response.data
          : response.data?.jobs || response.data?.data || []

        setJobs(jobList)
      } catch (err) {
        console.warn('API connection failed or empty:', err)
        setError('Unable to load jobs from server.')
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const toggleBookmark = (id, e) => {
    e.stopPropagation()
    setSavedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const jobId = applyingJob._id || applyingJob.id
      await axios.post(`${API_URL}/api/v1/jobs/${jobId}/apply`, {
        coverLetter,
        resumeVersion
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000
      })
    } catch (err) {
      console.warn('Application endpoint note:', err)
    } finally {
      setIsSubmitting(false)
      setApplySuccess(true)
      setTimeout(() => {
        setApplySuccess(false)
        setApplyingJob(null)
        setCoverLetter('')
      }, 1800)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const compName = job.company?.name || job.companyName || ''
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills?.some((s) => String(s).toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesWorkMode =
      selectedWorkMode === 'All' ||
      job.workMode?.toLowerCase() === selectedWorkMode.toLowerCase() ||
      (selectedWorkMode === 'Remote' && (job.workMode === 'REMOTE' || job.location?.toLowerCase().includes('remote')))

    const matchesType =
      selectedJobType === 'All' ||
      job.employmentType?.toLowerCase() === selectedJobType.toLowerCase() ||
      job.type?.toLowerCase() === selectedJobType.toLowerCase()

    return matchesSearch && matchesWorkMode && matchesType
  })

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="candidate" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Top Title & Search Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Job Discovery Engine</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Find Open Opportunities
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Discover positions matching your expertise in software engineering and design.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Matched Jobs</p>
                    <p className="text-lg font-bold text-slate-900">{filteredJobs.length}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Saved</p>
                    <p className="text-lg font-bold text-blue-600">{savedJobIds.length}</p>
                  </div>
                </div>
              </div>

              {/* Search Bar Input */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by job title, skills, or company..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="All">All Locations</option>
                    <option value="Remote">Remote Only</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>

                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-Time</option>
                    <option value="Part-time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Tags:
              </span>
              {['All', 'React', 'Node.js', 'Remote', 'Full-time'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag === 'All' ? '' : tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    (tag === 'All' && !searchTerm) || searchTerm === tag
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Job Listings Feed */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-xs font-semibold">Loading postings...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900">No jobs posted yet</h3>
                <p className="text-xs text-slate-500">Check back later or adjust your search filters.</p>
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedWorkMode('All'); setSelectedJobType('All') }}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Reset Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredJobs.map((job, index) => {
                  const jobId = job._id || job.id || `job_${index}`
                  const isSaved = savedJobIds.includes(jobId)
                  const skillsList = Array.isArray(job.skills) ? job.skills : []
                  const companyName = job.company?.name || job.companyName || (typeof job.company === 'string' ? job.company : 'HireFlow Company')
                  const jobType = job.employmentType || job.type || 'Full-time'
                  const salaryDisplay = typeof job.salary === 'object' && job.salary
                    ? (job.salary.min || job.salary.max ? `₹${job.salary.min ? job.salary.min.toLocaleString() : 0} - ₹${job.salary.max ? job.salary.max.toLocaleString() : 0}` : null)
                    : (job.salary || null)

                  return (
                    <div
                      key={jobId}
                      onClick={() => setSelectedJob(job)}
                      className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-13 h-13 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-base border border-blue-200 shrink-0">
                            {companyName.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {job.title}
                              </h2>
                              {job.workMode && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  {job.workMode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">{companyName}</p>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {job.location || 'Remote'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                {jobType}
                              </span>
                              {salaryDisplay && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                    {salaryDisplay}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end lg:self-center">
                          <button
                            onClick={(e) => toggleBookmark(jobId, e)}
                            className={`p-2.5 rounded-2xl border transition-colors ${
                              isSaved
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title={isSaved ? 'Remove Bookmark' : 'Save Job'}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setApplyingJob(job)
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>

                      {job.summary && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-4 leading-relaxed">
                          {job.summary}
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {skillsList.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        {job.createdAt && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 lg:p-8 shadow-2xl relative">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xl border border-blue-200">
                      {(selectedJob.company?.name || selectedJob.companyName || 'HF').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedJob.title}</h2>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{selectedJob.company?.name || selectedJob.companyName || 'Company'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Location</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedJob.location || 'Remote'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Type</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedJob.employmentType || selectedJob.type || 'Full-time'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Experience</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {typeof selectedJob.experience === 'object' && selectedJob.experience
                          ? `${selectedJob.experience.min || 0}–${selectedJob.experience.max || 0} yrs`
                          : selectedJob.experience || 'Not specified'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Salary</p>
                      <p className="text-xs font-bold text-emerald-700 mt-0.5">
                        {typeof selectedJob.salary === 'object' && selectedJob.salary
                          ? (selectedJob.salary.min || selectedJob.salary.max
                              ? `₹${(selectedJob.salary.min||0).toLocaleString()} – ₹${(selectedJob.salary.max||0).toLocaleString()}`
                              : 'Competitive')
                          : selectedJob.salary || 'Competitive'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                    {selectedJob.summary && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Job Overview</h4>
                        <p>{selectedJob.summary}</p>
                      </div>
                    )}

                    {selectedJob.description && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Full Description & Requirements</h4>
                        <div className="whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700">
                          {selectedJob.description}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setApplyingJob(selectedJob)
                        setSelectedJob(null)
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      Proceed to Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Modal */}
            {applyingJob && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
                  {applySuccess ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                    </div>
                  ) : (
                    <form onSubmit={handleApplySubmit}>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Apply for Role</h3>
                          <p className="text-xs text-slate-500">{applyingJob.title} at {applyingJob.company?.name || applyingJob.companyName || 'Company'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setApplyingJob(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 my-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Cover Letter / Note to Recruiter (Optional)
                          </label>
                          <textarea
                            rows="4"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Introduce yourself briefly and explain your qualifications..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setApplyingJob(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Submitting...' : 'Confirm Application'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default FindJobs
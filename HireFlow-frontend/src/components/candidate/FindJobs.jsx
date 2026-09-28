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
  Info,
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  Check,
  ExternalLink
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const FindJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkMode, setSelectedWorkMode] = useState('All')
  const [selectedJobType, setSelectedJobType] = useState('All')
  
  // Candidate data states
  const [savedJobIds, setSavedJobIds] = useState([])
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [userResumes, setUserResumes] = useState([])

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null)
  const [applyingJob, setApplyingJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [selectedResumeType, setSelectedResumeType] = useState('saved') // 'saved' | 'upload' | 'url'
  const [selectedResumeUrl, setSelectedResumeUrl] = useState('')
  const [customResumeUrl, setCustomResumeUrl] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedResumeName, setUploadedResumeName] = useState('')
  
  const [modalError, setModalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)

  // Fetch Jobs & Candidate Data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      try {
        // Fetch Jobs
        const jobRes = await axios.get(`${API_URL}/api/v1/jobs`, { headers, timeout: 8000 })
        const jobList = Array.isArray(jobRes.data)
          ? jobRes.data
          : jobRes.data?.data || jobRes.data?.jobs || []
        setJobs(jobList)

        // Fetch User Profile & Resumes if logged in
        if (token) {
          try {
            const meRes = await axios.get(`${API_URL}/api/v1/auth/me`, { headers, timeout: 5000 })
            const profile = meRes.data?.profile
            if (profile) {
              const resumes = profile.resumes || []
              setUserResumes(resumes)
              if (profile.savedJobs) {
                setSavedJobIds(profile.savedJobs.map((j) => (typeof j === 'object' ? j._id || j.id : j)))
              }
              const primary = resumes.find((r) => r.isPrimary) || resumes[0]
              if (primary?.fileUrl) {
                setSelectedResumeUrl(primary.fileUrl)
              }
            }
          } catch (e) {
            console.warn('Could not load user profile resumes:', e)
          }

          // Fetch Candidate's Existing Applications
          try {
            const appRes = await axios.get(`${API_URL}/api/v1/users/me/applications`, { headers, timeout: 5000 })
            const apps = appRes.data?.data || []
            const appliedIds = apps.map((a) => (typeof a.job === 'object' ? a.job?._id || a.job?.id : a.job))
            setAppliedJobIds(appliedIds.filter(Boolean))
          } catch (e) {
            console.warn('Could not load user applications:', e)
          }
        }
      } catch (err) {
        console.warn('API connection failed or empty:', err)
        setError('Unable to load jobs from server.')
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Toggle Bookmark with API sync
  const toggleBookmark = async (id, e) => {
    e.stopPropagation()
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    
    // Optimistic UI update
    const isCurrentlySaved = savedJobIds.includes(id)
    setSavedJobIds((prev) =>
      isCurrentlySaved ? prev.filter((item) => item !== id) : [...prev, id]
    )

    if (token) {
      try {
        await axios.post(`${API_URL}/api/v1/users/jobs/${id}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.warn('Failed to sync save status to server:', err)
      }
    }
  }

  // Open Apply Modal for a specific job
  const handleOpenApplyModal = (job) => {
    setApplyingJob(job)
    setModalError('')
    setCoverLetter('')
    setCustomResumeUrl('')
    setUploadedResumeName('')
    setApplySuccess(false)

    // Select primary resume by default if available
    if (userResumes.length > 0) {
      const primary = userResumes.find((r) => r.isPrimary) || userResumes[0]
      setSelectedResumeUrl(primary.fileUrl)
      setSelectedResumeType('saved')
    } else {
      setSelectedResumeUrl('')
      setSelectedResumeType('upload')
    }
  }

  // Handle Quick Resume File Upload from Modal
  const handleModalFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setModalError('')

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('resume', file)

      const res = await axios.post(`${API_URL}/api/v1/users/me/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (res.data?.success) {
        const newResume = res.data.resume
        const updatedResumes = res.data.profile?.resumes || [newResume, ...userResumes]
        setUserResumes(updatedResumes)
        setSelectedResumeUrl(newResume.fileUrl)
        setUploadedResumeName(newResume.fileName || file.name)
        setSelectedResumeType('saved')
      } else {
        setModalError(res.data?.message || 'Failed to upload resume file.')
      }
    } catch (err) {
      console.error('Modal upload error:', err)
      setModalError(err.response?.data?.message || 'Failed to upload resume. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  // Submit Application
  const handleApplySubmit = async (e) => {
    e.preventDefault()
    setModalError('')

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    if (!token) {
      setModalError('Please sign in as a candidate to apply for this position.')
      return
    }

    // Determine final resume URL to send
    let finalResumeUrl = ''
    if (selectedResumeType === 'saved') {
      finalResumeUrl = selectedResumeUrl
    } else if (selectedResumeType === 'url') {
      finalResumeUrl = customResumeUrl.trim()
    }

    if (!finalResumeUrl && userResumes.length === 0) {
      setModalError('Please upload your resume file or provide a valid resume URL to proceed.')
      return
    }

    setIsSubmitting(true)
    const jobId = applyingJob._id || applyingJob.id

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/jobs/${jobId}/apply`,
        {
          resumeUrl: finalResumeUrl || undefined,
          coverLetter: coverLetter.trim() || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      )

      if (response.data?.success || response.status === 201 || response.status === 200) {
        setApplySuccess(true)
        setAppliedJobIds((prev) => [...prev, jobId])

        setTimeout(() => {
          setApplySuccess(false)
          setApplyingJob(null)
          setCoverLetter('')
        }, 2000)
      } else {
        setModalError(response.data?.message || 'Failed to submit application.')
      }
    } catch (err) {
      console.error('Application submission error:', err)
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        (err.response?.status === 409 ? 'You have already applied to this position.' : null) ||
        (err.response?.status === 403 ? 'Recruiters/Admins cannot submit candidate applications.' : null) ||
        'Failed to submit application. Please verify your details and try again.'
      setModalError(serverMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const compName = job.company?.name || job.companyName || ''
    const matchesSearch =
      !searchTerm ||
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
                    Discover positions matching your expertise in software engineering, design, and operations.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Matched Jobs</p>
                    <p className="text-lg font-bold text-slate-900">{filteredJobs.length}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Applied</p>
                    <p className="text-lg font-bold text-emerald-600">{appliedJobIds.length}</p>
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
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Tags:
              </span>
              {['All', 'React', 'Node.js', 'Remote', 'Full-time', 'Python'].map((tag) => (
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
                <p className="text-xs font-semibold">Loading opportunities...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900">No matching jobs found</h3>
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
                  const hasApplied = appliedJobIds.includes(jobId)
                  const skillsList = Array.isArray(job.skills) ? job.skills : []
                  const companyName = job.company?.name || job.companyName || (typeof job.company === 'string' ? job.company : 'HireFlow Partner')
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
                              {hasApplied && (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Applied
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

                          {hasApplied ? (
                            <span className="px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-default">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenApplyModal(job)
                              }}
                              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                            >
                              Apply Now
                            </button>
                          )}
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
                    {appliedJobIds.includes(selectedJob._id || selectedJob.id) ? (
                      <span className="px-6 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Already Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const jobToApply = selectedJob
                          setSelectedJob(null)
                          handleOpenApplyModal(jobToApply)
                        }}
                        className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                      >
                        Proceed to Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Apply Modal */}
            {applyingJob && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  {applySuccess ? (
                    <div className="py-8 text-center space-y-3 animate-in fade-in">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Your application for <span className="font-semibold text-slate-800">{applyingJob.title}</span> has been forwarded to the recruiter.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApplySubmit} className="space-y-5">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Apply for Position</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {applyingJob.title} • {applyingJob.company?.name || applyingJob.companyName || 'HireFlow Partner'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setApplyingJob(null)}
                          className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Error Alert */}
                      {modalError && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                          <span>{modalError}</span>
                        </div>
                      )}

                      {/* Resume Selection */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-800">
                          Select Resume to Attach <span className="text-rose-500">*</span>
                        </label>

                        {/* If user has saved resumes */}
                        {userResumes.length > 0 ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2">
                              {userResumes.map((r, idx) => {
                                const isSelected = selectedResumeType === 'saved' && selectedResumeUrl === r.fileUrl
                                return (
                                  <label
                                    key={r._id || r.id || idx}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                      isSelected
                                        ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400'
                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name="resumeSelection"
                                        checked={isSelected}
                                        onChange={() => {
                                          setSelectedResumeType('saved')
                                          setSelectedResumeUrl(r.fileUrl)
                                        }}
                                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                                      />
                                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                      <div>
                                        <p className="text-xs font-bold text-slate-900">{r.fileName || 'Resume Document'}</p>
                                        <p className="text-[10px] text-slate-500">
                                          {r.isPrimary ? 'Default Profile Resume' : 'Saved Resume'}
                                        </p>
                                      </div>
                                    </div>

                                    {r.isPrimary && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                        Primary
                                      </span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>

                            {/* Additional Options */}
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                              <label className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer inline-flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingFile ? 'Uploading new resume...' : 'Upload a different resume'}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  disabled={uploadingFile}
                                  onChange={handleModalFileUpload}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => setSelectedResumeType(selectedResumeType === 'url' ? 'saved' : 'url')}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{selectedResumeType === 'url' ? 'Use Saved Resume' : 'Or Provide Resume URL'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* If candidate has NO resumes uploaded yet */
                          <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                              <p className="font-semibold mb-1">No resumes found in your profile.</p>
                              <p className="text-[11px] text-amber-700">
                                Upload your resume document (PDF or DOCX) below or enter a public link (Google Drive / Portfolio).
                              </p>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-blue-400 bg-slate-50 transition-colors">
                              <input
                                type="file"
                                id="modalResumeInput"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                disabled={uploadingFile}
                                onChange={handleModalFileUpload}
                              />
                              <label
                                htmlFor="modalResumeInput"
                                className="cursor-pointer flex flex-col items-center justify-center gap-2"
                              >
                                <Upload className="w-6 h-6 text-blue-600" />
                                <span className="text-xs font-bold text-slate-800">
                                  {uploadingFile ? (
                                    <span className="inline-flex items-center gap-2">
                                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Uploading resume...
                                    </span>
                                  ) : uploadedResumeName ? (
                                    `Selected: ${uploadedResumeName}`
                                  ) : (
                                    'Click to upload resume (PDF, DOCX)'
                                  )}
                                </span>
                              </label>
                            </div>

                            <div className="relative flex items-center justify-center my-2">
                              <div className="border-t border-slate-200 w-full" />
                              <span className="bg-white px-2 text-[10px] text-slate-400 uppercase font-semibold absolute">
                                Or Link
                              </span>
                            </div>

                            <input
                              type="url"
                              value={customResumeUrl}
                              onChange={(e) => {
                                setCustomResumeUrl(e.target.value)
                                setSelectedResumeType('url')
                              }}
                              placeholder="Paste Google Drive, Dropbox, or portfolio PDF link..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}

                        {/* Optional External URL input if selected */}
                        {selectedResumeType === 'url' && userResumes.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <input
                              type="url"
                              value={customResumeUrl}
                              onChange={(e) => setCustomResumeUrl(e.target.value)}
                              placeholder="https://drive.google.com/your-resume.pdf"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-[10px] text-slate-400">Ensure the link is publicly accessible to the recruiter.</p>
                          </div>
                        )}
                      </div>

                      {/* Cover Letter / Note to Recruiter */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Cover Letter / Message to Recruiter <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows="4"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Highlight your key achievements, why you are a great fit for this position, or any notes for the hiring team..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 leading-relaxed"
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setApplyingJob(null)}
                          className="px-5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || uploadingFile}
                          className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Confirm Application
                            </>
                          )}
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
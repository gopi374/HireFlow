import React, { useState, useEffect } from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  UserCheck,
  Star,
  FileText,
  CheckCircle2,
  Calendar,
  Download,
  Loader2,
  Users,
  Eye,
  Plus
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const EvaluateCandidate = () => {
  const [applications, setApplications] = useState([])
  const [selectedAppId, setSelectedAppId] = useState('')
  const [loading, setLoading] = useState(true)

  const [ratings, setRatings] = useState({
    technical: 4,
    architecture: 4,
    communication: 4,
    cultureFit: 4
  })

  const [notes, setNotes] = useState('')
  const [decision, setDecision] = useState('SHORTLISTED')
  const [isSaved, setIsSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('14:30')
  const [interviewType, setInterviewType] = useState('TECHNICAL')
  const [scheduleSuccess, setScheduleSuccess] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await fetch(`${API_URL}/api/v1/applications`, { headers })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const appList = data.data || data.applications || (Array.isArray(data) ? data : [])
        setApplications(appList)
        if (appList.length > 0) {
          setSelectedAppId(appList[0]._id || appList[0].id)
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.message || 'Could not load candidate applications.')
      }
    } catch (err) {
      console.error('Error fetching applications for evaluation:', err)
      setErrorMessage('Could not load candidate applications.')
    } finally {
      setLoading(false)
    }
  }

  const selectedApp = applications.find(a => (a._id || a.id) === selectedAppId)

  const setRatingCategory = (category, val) => {
    setRatings(prev => ({ ...prev, [category]: val }))
  }

  const handleSaveEvaluation = async (e) => {
    e.preventDefault()
    if (!selectedApp) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const appId = selectedApp._id || selectedApp.id

      // Update application status
      await fetch(`${API_URL}/api/v1/applications/${appId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: decision,
          reason: notes || `Evaluated by recruiter as ${decision}`
        })
      })

      // Add recruiter note if notes entered
      if (notes.trim()) {
        await fetch(`${API_URL}/api/v1/applications/${appId}/notes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ note: notes.trim() })
        })
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      console.error('Error saving evaluation:', err)
      setErrorMessage('Failed to save evaluation.')
    }
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedApp || !interviewDate) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const appId = selectedApp._id || selectedApp.id
      const jobId = selectedApp.job?._id || selectedApp.job?.id || selectedApp.job
      const candidateId = selectedApp.candidate?._id || selectedApp.candidate?.id || selectedApp.candidate

      const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00`).toISOString()

      const res = await fetch(`${API_URL}/api/v1/interviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          applicationId: appId,
          application: appId,
          job: jobId,
          candidate: candidateId,
          scheduledAt,
          durationMinutes: 45,
          type: interviewType,
          mode: 'ONLINE'
        })
      })

      if (res.ok) {
        setScheduleSuccess(true)
        setTimeout(() => {
          setScheduleSuccess(false)
          setShowScheduleModal(false)
        }, 1800)
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.message || 'Failed to schedule interview.')
      }
    } catch (err) {
      console.error('Failed to schedule interview:', err)
      setErrorMessage('Failed to schedule interview.')
    }
  }

  const candidateName = selectedApp?.candidate?.name || 'Applicant'
  const candidateEmail = selectedApp?.candidate?.email || 'N/A'
  const candidatePhone = selectedApp?.candidate?.phone || 'N/A'
  const roleTitle = selectedApp?.job?.title || 'Applied Position'
  const resumeUrl = selectedApp?.resumeUrl

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="recruiter" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Candidate Assessment Portal</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Evaluate Candidate: {candidateName}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Applying for <span className="text-slate-900 font-semibold">{roleTitle}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {applications.length > 0 && (
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                    >
                      {applications.map(app => (
                        <option key={app._id || app.id} value={app._id || app.id}>
                          {app.candidate?.name || 'Candidate'} - {app.job?.title || 'Role'}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={() => setShowScheduleModal(true)}
                    disabled={!selectedApp}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center gap-2 shrink-0"
                  >
                    <Calendar className="w-4 h-4" /> Schedule Interview
                  </button>
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
                <p className="text-xs font-semibold text-slate-500">Loading candidate profile for evaluation...</p>
              </div>
            ) : !selectedApp ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-2">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Applicants to Evaluate</h3>
                <p className="text-xs text-slate-500">There are currently no candidate applications available to assess.</p>
              </div>
            ) : (
              /* Two Column Layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Candidate Information Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 lg:col-span-1">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Applicant Profile</h3>
                    <div className="space-y-1">
                      <h2 className="text-xl font-extrabold text-slate-900">{candidateName}</h2>
                      <p className="text-xs font-semibold text-blue-600">{roleTitle}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-400">Email:</span>
                      <p className="font-medium text-slate-900">{candidateEmail}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Phone:</span>
                      <p className="font-medium text-slate-900">{candidatePhone}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Current Status:</span>
                      <p className="font-bold text-blue-700">{selectedApp.status || 'APPLIED'}</p>
                    </div>
                  </div>

                  {resumeUrl && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Attached Resume</span>
                      <a
                        href={resumeUrl.startsWith('http') ? resumeUrl : `${API_URL}${resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-2 transition-all"
                      >
                        <FileText className="w-4 h-4 text-blue-600" /> View Candidate Resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Evaluation Form Card */}
                <form onSubmit={handleSaveEvaluation} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
                  <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                    Recruiter Scorecard & Assessment
                  </h3>

                  {/* Ratings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['technical', 'architecture', 'communication', 'cultureFit'].map((cat) => (
                      <div key={cat} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {cat} Score
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingCategory(cat, star)}
                              className="p-1 focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratings[cat] ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Decision */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hiring Stage Decision
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="SCREENING">Advance to Screening</option>
                      <option value="SHORTLISTED">Shortlist for Interview</option>
                      <option value="INTERVIEW">Schedule Technical Interview</option>
                      <option value="SELECTED">Select / Extend Offer</option>
                      <option value="REJECTED">Reject Application</option>
                    </select>
                  </div>

                  {/* Recruiter Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Internal Evaluation Notes & Feedback
                    </label>
                    <textarea
                      rows="4"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add specific comments about technical capabilities, communication, or interview performance..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {isSaved ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Evaluation recorded successfully!
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Ready to record assessment</span>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Save Evaluation
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* Schedule Interview Modal */}
            {showScheduleModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Schedule Interview with {candidateName}
                  </h3>

                  <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Interview Type</label>
                      <select
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      >
                        <option value="TECHNICAL">Technical Round</option>
                        <option value="BEHAVIORAL">Behavioral Round</option>
                        <option value="HR">HR Screening</option>
                        <option value="MANAGERIAL">Managerial Round</option>
                      </select>
                    </div>

                    {scheduleSuccess && (
                      <p className="text-emerald-600 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Interview Invitation Scheduled!
                      </p>
                    )}

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                      >
                        Confirm Schedule
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default EvaluateCandidate
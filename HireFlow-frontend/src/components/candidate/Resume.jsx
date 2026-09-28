import React, { useState, useEffect } from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  FileUp,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Star,
  Upload,
  Eye,
  ShieldCheck,
  Loader2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Resume = () => {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await fetch(`${API_URL}/api/v1/auth/me`, { headers })
      if (res.ok) {
        const data = await res.json()
        const fetchedResumes = data.profile?.resumes || []
        setResumes(fetchedResumes)
      }
    } catch (err) {
      console.error('Error fetching resumes:', err)
      setErrorMessage('Could not load resumes from server.')
    } finally {
      setLoading(false)
    }
  }

  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0]

  const setPrimary = (id) => {
    setResumes(prev =>
      prev.map(r => ({ ...r, isPrimary: (r._id || r.id) === id }))
    )
  }

  const handleDelete = (id) => {
    if (resumes.length === 1) {
      alert('You must keep at least one active resume in your profile.')
      return
    }
    if (window.confirm('Delete this resume version?')) {
      setResumes(prev => prev.filter(r => (r._id || r.id) !== id))
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    setErrorMessage('')

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('resume', selectedFile)

      const res = await fetch(`${API_URL}/api/v1/users/me/resume`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      })

      const data = await res.json()
      if (res.ok && data.success) {
        if (data.profile?.resumes) {
          setResumes(data.profile.resumes)
        } else if (data.resume) {
          setResumes(prev => [data.resume, ...prev])
        }
        setSelectedFile(null)
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 3000)
      } else {
        setErrorMessage(data.message || 'Failed to upload resume file.')
      }
    } catch (err) {
      console.error('Resume upload error:', err)
      setErrorMessage('Network error during file upload.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (e) {
      return 'Recently'
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="candidate" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Resume & Document Center</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Manage Your Resumes
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload PDF/DOCX resume versions and evaluate ATS keyword optimization for recruiters.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Resume Management</span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Drag and Drop Upload Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0])
                }
              }}
              className={`bg-white border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedFile ? selectedFile.name : 'Upload New Resume Version'}
                </h3>
                <p className="text-xs text-slate-500">
                  Drag & drop your file here, or browse from your computer. Formats: PDF, DOC, DOCX (Max 10MB).
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <input
                    type="file"
                    id="resumeInput"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0])
                    }}
                  />
                  <label
                    htmlFor="resumeInput"
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Select File
                  </label>

                  {selectedFile && (
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        'Confirm Upload'
                      )}
                    </button>
                  )}
                </div>

                {uploadSuccess && (
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-4 h-4" /> Resume successfully added & updated!
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Fetching your saved resumes...</p>
              </div>
            ) : (
              <>
                {/* Resume Analytics Card */}
                {primaryResume && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Default Resume
                        </span>
                        <span className="text-xs text-slate-500">Uploaded {formatDate(primaryResume.uploadedAt)}</span>
                      </div>

                      <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        {primaryResume.fileName || 'Resume Document'}
                      </h2>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Size: {formatFileSize(primaryResume.fileSize)}</span>
                        <span>•</span>
                        <span>Type: {primaryResume.mimeType || 'PDF Document'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase text-slate-500">Status</span>
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-slate-900">Active Resume</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          This resume will be submitted by default when you apply to positions.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex gap-2">
                        <a
                          href={primaryResume.fileUrl ? (primaryResume.fileUrl.startsWith('http') ? primaryResume.fileUrl : `${API_URL}${primaryResume.fileUrl}`) : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </a>
                        <a
                          href={primaryResume.fileUrl ? (primaryResume.fileUrl.startsWith('http') ? primaryResume.fileUrl : `${API_URL}${primaryResume.fileUrl}`) : '#'}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    </div>

                  </div>
                )}

                {/* Saved Resumes List */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Saved Resume Versions</h3>

                  {resumes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold">No resumes uploaded yet.</p>
                      <p className="text-[11px] text-slate-400">Upload your PDF or Word document above to attach it to your applications.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map(r => {
                        const resId = r._id || r.id
                        return (
                          <div
                            key={resId}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                              r.isPrimary
                                ? 'bg-blue-50/50 border-blue-200'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-white text-blue-600 border border-slate-200">
                                <FileCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  {r.fileName || 'Resume Document'}
                                  {r.isPrimary && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px]">
                                      Primary
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {formatFileSize(r.fileSize)} • Uploaded {formatDate(r.uploadedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!r.isPrimary && (
                                <button
                                  onClick={() => setPrimary(resId)}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                                >
                                  Make Primary
                                </button>
                              )}
                              {r.fileUrl && (
                                <a
                                  href={r.fileUrl.startsWith('http') ? r.fileUrl : `${API_URL}${r.fileUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(resId)}
                                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default Resume
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  PlusCircle,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Send,
  Building2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const INITIAL_FORM = {
  title: '',
  department: 'Engineering',
  location: '',
  workMode: 'Hybrid',
  type: 'Full-time',
  experience: '1-3 Years',
  salaryMin: '',
  salaryMax: '',
  currency: 'INR',
  skills: '',
  summary: '',
  responsibilities: '',
  requirements: ''
}

const CreateJobs = () => {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [companyInfo, setCompanyInfo] = useState({ name: 'My Company', location: 'Remote' })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('Form')

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
        if (token) {
          const res = await axios.get(`${API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const u = res.data?.user || {}
          setCompanyInfo({
            name: u.company?.name || u.companyName || (u.name ? `${u.name}'s Enterprise` : 'My Company'),
            location: u.company?.location || u.location || 'Remote'
          })
        }
      } catch (e) {
        console.warn('Could not load company info for job creation:', e)
      }
    }
    fetchCompanyData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSubmitted(false)
    setErrorMessage('')

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location || companyInfo.location || 'Remote',
        workMode: formData.workMode,
        employmentType: formData.type,
        experience: formData.experience,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        currency: formData.currency || 'INR',
        skills: skillsArray,
        summary: formData.summary,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        description: [formData.summary, formData.responsibilities, formData.requirements].filter(Boolean).join('\n\n') || formData.title,
        status: 'PUBLISHED'
      }

      await axios.post(`${API_URL}/api/v1/jobs`, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        timeout: 8000
      })

      setIsSubmitted(true)
      setFormData(INITIAL_FORM)
      setTimeout(() => setIsSubmitted(false), 4000)
    } catch (err) {
      console.error('Job creation error:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to publish job posting.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const companyInitial = (companyInfo.name || 'MC').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="recruiter" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header Title Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Job Management</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Post a New Job Opening
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Publish an opening for <span className="font-semibold text-slate-700">{companyInfo.name}</span>. Only members of your company will see and manage this listing.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('Form')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'Form' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Form Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Preview')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'Preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Card Preview
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Success Banner */}
            {isSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Job posting successfully published! It is now visible to candidates and managed from your Company Jobs dashboard.</span>
              </div>
            )}

            {/* Main Form */}
            {activeTab === 'Form' ? (
              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">

                {/* Basic Details Section */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Role Basics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Full Stack Engineer"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option>Engineering</option>
                        <option>Design & UX</option>
                        <option>Product Management</option>
                        <option>Marketing</option>
                        <option>Sales & HR</option>
                        <option>Data & Analytics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                      <select
                        name="workMode"
                        value={formData.workMode}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option>Hybrid</option>
                        <option>Remote</option>
                        <option>On-site</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder={`e.g. ${companyInfo.location || 'Remote / Hybrid'}`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Compensation & Experience */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Compensation & Level
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Required</label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option>0-1 Years (Fresher)</option>
                        <option>1-3 Years</option>
                        <option>2-4 Years</option>
                        <option>5+ Years (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Min (INR / year)</label>
                      <input
                        type="number"
                        name="salaryMin"
                        placeholder="e.g. 600000"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Max (INR / year)</label>
                      <input
                        type="number"
                        name="salaryMax"
                        placeholder="e.g. 1200000"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills & Description */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                    Skills & Responsibilities
                  </h2>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Required Skills (Comma Separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Express, MongoDB"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role Summary</label>
                    <textarea
                      rows="3"
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      placeholder="Brief overview of the mission, team, and day-to-day impact..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('Preview')}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Preview Card
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Publishing...' : 'Publish Job Opening'}
                  </button>
                </div>

              </form>
            ) : (
              /* Preview Card */
              <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Candidate View Preview</h3>
                  <span className="text-xs font-bold text-blue-600">{companyInfo.name}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                      {companyInitial}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{formData.title || 'Senior Job Opening'}</h2>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {companyInfo.name} • {formData.location || companyInfo.location || 'Remote'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{formData.summary || 'Role summary will appear here.'}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab('Form')}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Back to Edit Form
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateJobs
import React, { useState, useEffect } from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  User,
  Briefcase,
  Award,
  Globe,
  Link2,
  Plus,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  Camera,
  Loader2,
  Trash2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CandidateProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    skills: [],
    experience: [],
    education: [],
    socials: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // New experience inline form state
  const [newExp, setNewExp] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  })
  const [showAddExp, setShowAddExp] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      let userObj = {}
      try {
        userObj = JSON.parse(localStorage.getItem('user') || '{}')
      } catch (e) {
        userObj = {}
      }

      const res = await fetch(`${API_URL}/api/v1/auth/me`, { headers })
      if (res.ok) {
        const data = await res.json()
        const user = data.user || userObj
        const candProfile = data.profile || {}

        setProfile({
          fullName: user.name || userObj.name || '',
          email: user.email || userObj.email || '',
          phone: user.phone || userObj.phone || '',
          headline: candProfile.headline || '',
          location: candProfile.location || '',
          about: candProfile.summary || '',
          skills: Array.isArray(candProfile.skills) ? candProfile.skills : [],
          experience: Array.isArray(candProfile.experience) ? candProfile.experience : [],
          education: Array.isArray(candProfile.education) ? candProfile.education : [],
          socials: {
            github: candProfile.links?.github || '',
            linkedin: candProfile.links?.linkedin || '',
            portfolio: candProfile.links?.portfolio || ''
          }
        })
      } else {
        // Fallback to localStorage user info if token check fails or guest
        setProfile(prev => ({
          ...prev,
          fullName: userObj.name || '',
          email: userObj.email || '',
          phone: userObj.phone || ''
        }))
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      setErrorMessage('Could not load profile from server. Local draft displayed.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      socials: { ...prev.socials, [name]: value }
    }))
  }

  const addSkill = (e) => {
    e.preventDefault()
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }))
  }

  const addExperienceItem = (e) => {
    e.preventDefault()
    if (!newExp.title.trim() || !newExp.company.trim()) return

    const item = {
      id: Date.now(),
      title: newExp.title.trim(),
      company: newExp.company.trim(),
      duration: newExp.duration.trim() || 'Present',
      description: newExp.description.trim()
    }

    setProfile(prev => ({
      ...prev,
      experience: [item, ...prev.experience]
    }))
    setNewExp({ title: '', company: '', duration: '', description: '' })
    setShowAddExp(false)
  }

  const removeExperienceItem = (id) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => (exp.id || exp._id) !== id)
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage('')

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      // Update User account details (name, phone)
      await fetch(`${API_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: profile.fullName,
          phone: profile.phone
        })
      })

      // Update Candidate Profile details
      const profRes = await fetch(`${API_URL}/api/v1/users/me/candidate-profile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          headline: profile.headline,
          summary: profile.about,
          location: profile.location,
          skills: profile.skills,
          experience: profile.experience,
          education: profile.education,
          links: profile.socials
        })
      })

      if (profRes.ok) {
        // Update user in localStorage
        try {
          const userObj = JSON.parse(localStorage.getItem('user') || '{}')
          userObj.name = profile.fullName
          userObj.phone = profile.phone
          localStorage.setItem('user', JSON.stringify(userObj))
        } catch (e) {}

        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      } else {
        const errData = await profRes.json().catch(() => ({}))
        setErrorMessage(errData.message || 'Failed to update candidate profile.')
      }
    } catch (err) {
      console.error('Error saving candidate profile:', err)
      setErrorMessage('Network error while saving profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="candidate" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading your profile details...</p>
              </div>
            ) : (
              <>
                {/* Profile Header Banner */}
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-md">
                        {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 rounded-xl bg-slate-900 text-white shadow-md hover:bg-blue-600 transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Candidate Profile & Competencies</span>
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                        {profile.fullName || 'User Profile'}
                      </h1>
                      <p className="text-xs text-slate-600 max-w-xl">
                        {profile.headline || 'Add a professional headline to highlight your key skills.'}
                      </p>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  
                  {/* Personal Information */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <User className="w-4 h-4 text-blue-600" />
                      Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={profile.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Jane Doe"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                        <input
                          type="text"
                          name="headline"
                          value={profile.headline}
                          onChange={handleInputChange}
                          placeholder="e.g. Full Stack Developer | React & Node.js"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          disabled
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={profile.location}
                          onChange={handleInputChange}
                          placeholder="City, State, Country"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">About / Bio</label>
                        <textarea
                          rows="4"
                          name="about"
                          value={profile.about}
                          onChange={handleInputChange}
                          placeholder="Write a brief professional summary about your career background and expertise..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Tag Manager */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Award className="w-4 h-4 text-blue-600" />
                      Technical Skills & Competencies
                    </h2>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill (e.g. React.js, Python, PostgreSQL)..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={addSkill}
                        type="button"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    {profile.skills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic pt-1">No technical skills added yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Work Experience */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        Work Experience
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowAddExp(!showAddExp)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                      </button>
                    </div>

                    {/* Add Experience Form */}
                    {showAddExp && (
                      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                        <h4 className="text-xs font-bold text-blue-900">Add New Work Experience</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Job Title (e.g. Software Engineer)"
                            value={newExp.title}
                            onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={newExp.company}
                            onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 2023 - Present)"
                            value={newExp.duration}
                            onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 sm:col-span-2"
                          />
                          <textarea
                            placeholder="Key achievements or summary..."
                            rows="2"
                            value={newExp.description}
                            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                            className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 sm:col-span-2"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowAddExp(false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={addExperienceItem}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                          >
                            Save Position
                          </button>
                        </div>
                      </div>
                    )}

                    {profile.experience.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No work experience listed yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {profile.experience.map((exp, idx) => {
                          const expId = exp.id || exp._id || idx
                          return (
                            <div key={expId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 relative group">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-500">{exp.duration}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeExperienceItem(expId)}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs font-semibold text-blue-700">{exp.company}</p>
                              {exp.description && (
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Social Profiles & Web Links
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" /> GitHub Profile
                        </label>
                        <input
                          type="text"
                          name="github"
                          value={profile.socials.github}
                          onChange={handleSocialChange}
                          placeholder="https://github.com/username"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile
                        </label>
                        <input
                          type="text"
                          name="linkedin"
                          value={profile.socials.linkedin}
                          onChange={handleSocialChange}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600" /> Portfolio URL
                        </label>
                        <input
                          type="text"
                          name="portfolio"
                          value={profile.socials.portfolio}
                          onChange={handleSocialChange}
                          placeholder="https://yourportfolio.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    {isSaved ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">All changes ready to be saved</span>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Profile Changes
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default CandidateProfile
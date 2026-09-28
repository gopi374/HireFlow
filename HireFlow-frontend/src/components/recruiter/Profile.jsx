import React, { useState, useEffect } from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'
import {
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Save,
  Loader2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const RecruiterProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    website: '',
    location: '',
    description: '',
    verificationStatus: 'APPROVED'
  })
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const u = data.user || data.data || {}
        setProfile({
          fullName: u.name || '',
          title: u.title || u.designation || 'Technical Recruiter',
          email: u.email || '',
          phone: u.phone || '',
          companyName: u.company?.name || u.companyName || 'HireFlow Enterprise',
          industry: u.company?.industry || u.industry || 'Technology Services',
          website: u.company?.website || u.website || 'https://hireflow.io',
          location: u.company?.location || u.location || 'Indore, India',
          description: u.company?.description || u.description || 'Modern automated hiring & recruitment platform.',
          verificationStatus: u.company?.verificationStatus || u.verificationStatus || 'APPROVED'
        })
      }
    } catch (err) {
      console.error('Failed to fetch recruiter profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const res = await fetch(`${API_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          title: profile.title
        })
      })
      if (res.ok) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'HF'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <DashNav />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        <DashLinks role="recruiter" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading recruiter profile...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-md">
                        {getInitials(profile.companyName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">{profile.companyName || 'Company Profile'}</h1>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Company
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{profile.title} • {profile.fullName}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Verification Status</p>
                      <p className="text-xs font-bold text-emerald-700 mt-0.5">{profile.verificationStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6">

                  {/* Recruiter Details */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <User className="w-4 h-4 text-blue-600" />
                      Recruiter Contact Profile
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={profile.fullName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          name="title"
                          value={profile.title}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Company Profile & Branding
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={profile.companyName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
                        <input
                          type="text"
                          name="industry"
                          value={profile.industry}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Website Domain</label>
                        <input
                          type="text"
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location</label>
                        <input
                          type="text"
                          name="location"
                          value={profile.location}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description</label>
                        <textarea
                          rows="4"
                          name="description"
                          value={profile.description}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    {isSaved ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Company profile saved!
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Updates will be visible on active job posts</span>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
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

export default RecruiterProfile
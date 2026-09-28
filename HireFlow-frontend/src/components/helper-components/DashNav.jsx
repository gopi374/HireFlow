import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Bell, User, LogOut, Search, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const DashNav = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user: authUser, logout } = useAuth()

  const user = authUser || JSON.parse(localStorage.getItem('user') || '{}')
  const username = user.name || user.username || (String(user.role).toLowerCase() === 'recruiter' ? 'Recruiter' : 'Candidate')
  const userEmail = user.email || ''
  const initial = username.charAt(0).toUpperCase()
  const role = String(user.role || 'candidate').toLowerCase()

  const notifications = [
    { id: 1, title: 'Interview Scheduled', time: '10 mins ago', unread: true },
    { id: 2, title: 'Application Status Updated', time: '2 hours ago', unread: true },
    { id: 3, title: 'New Job Match Available', time: '1 day ago', unread: false }
  ]

  const handleLogout = () => {
    if (logout) {
      logout()
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-indigo-500 text-white shadow-sm border-b border-indigo-600">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-extrabold shadow-md group-hover:scale-105 transition-transform">
              <img src='/public/logo.png' className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex items-center">
              <span className="text-xl font-extrabold tracking-tight text-white">
                HireFlow
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                {role}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center relative w-72">
            <Search className="absolute left-3 w-4 h-4 text-indigo-200" />
            <input
              type="text"
              placeholder="Quick search jobs, applicants..."
              className="w-full bg-indigo-600/60 text-xs text-white pl-9 pr-4 py-2 rounded-xl border border-indigo-400/40 focus:outline-none focus:bg-indigo-700/80 transition-all placeholder:text-indigo-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false) }}
              className="relative p-2 rounded-xl text-indigo-100 hover:text-white hover:bg-indigo-600 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-300 rounded-full ring-2 ring-indigo-500 animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</h4>
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">2 New</span>
                </div>
                <div className="space-y-1">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-2.5 rounded-xl text-xs transition-colors ${n.unread ? 'bg-indigo-50/60 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-900 font-semibold">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                  <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">Mark all as read</button>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-indigo-400/40 hidden sm:block" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false) }}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-indigo-600 transition-colors focus:outline-none"
              aria-expanded={menuOpen}
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-200 text-slate-900 font-bold text-sm shadow-sm">
                {initial}
              </span>
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-semibold text-white leading-tight">{username}</p>
                <p className="text-[10px] text-indigo-200 font-normal capitalize">{role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-indigo-200 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-900">{username}</p>
                  <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                </div>

                <div className="p-1">
                  <Link
                    to={`/${role}/profile`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-indigo-500" />
                    My Profile
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashNav
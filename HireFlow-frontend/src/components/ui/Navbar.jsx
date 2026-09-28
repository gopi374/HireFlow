import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, User, LayoutDashboard, LogOut, Sparkles, Briefcase, PlusCircle } from 'lucide-react'
import '../../index.css'

const Navbar = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userState, setUserState] = useState({ isLoggedIn: false, user: {}, role: 'candidate' })

  useEffect(() => {
    const checkAuth = () => {
      let userObj = {}
      try {
        userObj = JSON.parse(localStorage.getItem('user') || '{}')
      } catch (e) {
        userObj = {}
      }

      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const isLoggedIn = Boolean(token || userObj.email || userObj.name || userObj.role)
      const role = String(userObj.role || 'candidate').toLowerCase()

      setUserState({ isLoggedIn, user: userObj, role })
    }

    checkAuth()
    // Listen for storage changes in case of cross-tab login/logout
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUserState({ isLoggedIn: false, user: {}, role: 'candidate' })
    setMenuOpen(false)
    navigate('/login')
  }

  const username = userState.user.name || userState.user.username || userState.user.email?.split('@')[0] || 'User'
  const userEmail = userState.user.email || 'user@hireflow.com'
  const initial = username.charAt(0).toUpperCase()
  const role = userState.role

  return (
    <nav className="bg-indigo-500 px-4 py-3 shadow-md border-b border-indigo-600 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform">
            <img src='logo.png' className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            HireFlow
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-indigo-100">
          <a href="#hero" className="hover:text-white transition">About</a>
          <a href="#working" className="hover:text-white transition">Working</a>
          <a href="#services" className="hover:text-white transition">Services</a>
          {userState.isLoggedIn && (
            <Link
              to={`/${role}/dash`}
              className="text-white hover:text-indigo-200 transition font-bold flex items-center gap-1.5 bg-indigo-600/50 px-3 py-1 rounded-xl border border-indigo-400/30"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        {/* Right Section: Auth State / Role Profile */}
        <div className="flex items-center gap-3">
          {userState.isLoggedIn ? (
            /* Role-Based Profile Icon & Dropdown */
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/40 text-white transition-all focus:outline-none cursor-pointer shadow-sm"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-slate-900 font-black text-xs flex items-center justify-center shadow-sm">
                  {initial}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-bold leading-tight text-white">{username}</p>
                  <span className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-indigo-200 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* User Banner Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{username}</p>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">
                        {role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>
                  </div>

                  {/* Role-Based Quick Links */}
                  <div className="p-1 space-y-0.5">
                    <Link
                      to={`/${role}/dash`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      {role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Workspace'}
                    </Link>

                    <Link
                      to={`/${role}/profile`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-500" />
                      My Profile
                    </Link>

                    {role === 'recruiter' ? (
                      <Link
                        to="/recruiter/create-jobs"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-500" />
                        Post a Job
                      </Link>
                    ) : (
                      <Link
                        to="/candidate/find"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        Find Jobs
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Login / Signup Buttons */
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 rounded-xl transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4.5 py-2 text-sm font-bold text-indigo-900 bg-white rounded-xl hover:bg-slate-100 shadow-sm transition-all"
              >
                Signup
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar
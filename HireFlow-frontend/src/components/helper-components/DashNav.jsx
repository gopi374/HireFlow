import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const DashNav = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const username = user.name || user.username || 'User'
  const initial = username.charAt(0).toUpperCase()
  const role = String(user.role || 'candidate').toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="flex justify-between items-center bg-indigo-400 py-3 px-5">
      <Link to="/" className="flex items-center gap-3">
        <img
          className="w-10 h-10 rounded-xl object-cover"
          src="/logo.png"
          alt="HireFlow Logo"
        />
        <h1 className="text-xl font-bold text-gray-900">HireFlow</h1>
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2"
          aria-expanded={menuOpen}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-200 font-bold">
            {initial}
          </span>
          <span className="font-medium">{username}</span>
          <span><ChevronDown /></span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg bg-white p-2 shadow-lg">
            <Link
              to={`/${role}/profile`}
              onClick={() => setMenuOpen(false)}
              className="block rounded px-3 py-2 hover:bg-gray-100"
            >
              My Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded px-3 py-2 text-left text-red-600 hover:bg-gray-100"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default DashNav
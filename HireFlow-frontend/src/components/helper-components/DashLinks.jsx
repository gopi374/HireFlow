import { NavLink, useNavigate } from 'react-router-dom'

const linksByRole = {
  candidate: [
    { label: 'Dashboard', path: '/candidate/dash' },
    { label: 'Jobs', path: '/candidate/find' },
    { label: 'Applications', path: '/candidate/apply' },
    { label: 'Track Applications', path: '/candidate/track' },
    { label: 'Resume', path: '/candidate/resume' },
    { label: 'Profile', path: '/candidate/profile' },
  ],
  recruiter: [
    { label: 'Dashboard', path: '/recruiter/dash' },
    { label: 'Jobs', path: '/recruiter/jobs' },
    { label: 'Create Job', path: '/recruiter/create-jobs' },
    { label: 'Applications', path: '/recruiter/applications' },
    { label: 'Manage Jobs', path: '/recruiter/manage-jobs' },
    { label: 'Evaluate Candidates', path: '/recruiter/evaluate' },
    { label: 'Profile', path: '/recruiter/profile' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dash' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Jobs', path: '/admin/jobs' },
    { label: 'Profile', path: '/admin/profile' },
  ],
}

const DashLinks = ({ role = 'candidate' }) => {
  const navigate = useNavigate()
  const links = linksByRole[role] || linksByRole.candidate

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className="sticky top-0 h-screen flex flex-col justify-between bg-blue-100 shadow-sm">
      <nav className="flex flex-col gap-2 px-4 py-6">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `rounded-lg px-4 py-3 transition ${
                isActive
                  ? 'bg-indigo-500 font-semibold text-white'
                  : 'text-gray-700 hover:bg-indigo-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 px-4 py-6">
        <NavLink
          to="/help"
          className="rounded-lg px-4 py-3 text-gray-700 hover:bg-indigo-100"
        >
          Help
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
    </aside>
  )
}

export default DashLinks
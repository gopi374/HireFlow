import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  FileText,
  GitPullRequest,
  FileUp,
  User,
  PlusCircle,
  Briefcase,
  UserCheck,
  SlidersHorizontal,
  HelpCircle,
  LogOut
} from 'lucide-react'

const linksByRole = {
  candidate: [
    { label: 'Dashboard', path: '/candidate/dash', icon: LayoutDashboard },
    { label: 'Find Jobs', path: '/candidate/find', icon: Search },
    { label: 'My Applications', path: '/candidate/apply', icon: FileText },
    { label: 'Track Process', path: '/candidate/track', icon: GitPullRequest },
    { label: 'Resume & Documents', path: '/candidate/resume', icon: FileUp },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
  ],
  recruiter: [
    { label: 'Dashboard', path: '/recruiter/dash', icon: LayoutDashboard },
    { label: 'Post a Job', path: '/recruiter/create-jobs', icon: PlusCircle },
    { label: 'All Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Application Pipeline', path: '/recruiter/applications', icon: GitPullRequest },
    { label: 'Candidate Evaluation', path: '/recruiter/evaluate', icon: UserCheck },
    { label: 'Manage Positions', path: '/recruiter/manage-jobs', icon: SlidersHorizontal },
    { label: 'Company Profile', path: '/recruiter/profile', icon: User },
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
    <aside className="w-64 shrink-0 bg-blue-100 border-r border-blue-200 text-slate-700 flex flex-col justify-between sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto select-none shadow-sm z-30">
      <div className="px-4 py-6">
        <div className="px-3 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {role === 'recruiter' ? 'Recruiter Portal' : 'Candidate Workspace'}
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-700 hover:bg-indigo-200/60 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-blue-200 space-y-1 bg-blue-100/90">
        <NavLink
          to="/help"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-200/60 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Help & Support</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}

export default DashLinks
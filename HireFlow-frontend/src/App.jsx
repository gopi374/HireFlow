import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// main routes
import Home from './components/ui/Home'
import Login from './components/ui/Login'
import Signup from './components/ui/Signup'
import NotFound from './components/ui/NotFound'

// candidate routes
import CandidadateRoute from './CandidadateRoute'
import Dashboard from './components/candidate/Dashboard'
import ApplyJobs from './components/candidate/ApplyJobs'
import FindJobs from './components/candidate/FindJobs'
import Profile from './components/candidate/Profile'
import Resume from './components/candidate/Resume'
import TrackProcess from './components/candidate/TrackProcess'

// recruiter routes
import RecruiterRoutes from './RecruiterRoutes'
import RecDashboard from './components/recruiter/Dashboard'
import CreateJobs from './components/recruiter/CreateJobs'
import Jobs from './components/recruiter/Jobs'
import ApplicationPipeline from './components/recruiter/ApplicationPipeline'
import EvaluateCandidate from './components/recruiter/EvaluateCandidate'
import ManageJobs from './components/recruiter/ManageJobs'
import RecProfile from './components/recruiter/Profile'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Main Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        {/* Candidate Routes */}
        <Route element={<CandidadateRoute />}>
          <Route path='/candidate/dash' element={<Dashboard />} />
          <Route path='/candidate/apply' element={<ApplyJobs />} />
          <Route path='/candidate/find' element={<FindJobs />} />
          <Route path='/candidate/profile' element={<Profile />} />
          <Route path='/candidate/resume' element={<Resume />} />
          <Route path='/candidate/track' element={<TrackProcess />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<RecruiterRoutes />}>
          <Route path='/recruiter/dash' element={<RecDashboard />} />
          <Route path='/recruiter/create-jobs' element={<CreateJobs />} />
          <Route path='/recruiter/jobs' element={<Jobs />} />
          <Route path='/recruiter/applications' element={<ApplicationPipeline />} />
          <Route path='/recruiter/evaluate' element={<EvaluateCandidate />} />
          <Route path='/recruiter/manage-jobs' element={<ManageJobs />} />
          <Route path='/recruiter/profile' element={<RecProfile />} />
        </Route>

        {/* 404 Route */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
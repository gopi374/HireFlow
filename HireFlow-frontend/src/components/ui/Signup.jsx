import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../API/auth'
import './Auth.css'

const Logo = () => (
  <Link to="/" className="auth-logo">
    <img className='w-15 h-15' src="/logo.png" alt="HireFlow Logo" />
    <span>Hire<span>Flow</span></span>
  </Link>
)

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState('candidate')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const navigate = useNavigate()

  const roles = [
    {
      id: 'candidate',
      icon: '♟',
      title: 'Candidate',
      subtitle: 'Find jobs & grow',
    },
    {
      id: 'recruiter',
      icon: '▣',
      title: 'Recruiter',
      subtitle: 'Hire top talent',
    },
    {
      id: 'admin',
      icon: '⬟',
      title: 'Admin',
      subtitle: 'Manage platform',
    },
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      role: selectedRole.toUpperCase(), // 'CANDIDATE', 'RECRUITER', 'ADMIN'
    }

    try {
      const data = await registerUser(payload)

      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.tokens?.accessToken) {
        localStorage.setItem('accessToken', data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      setSuccessMsg(data.message || 'Account Created Successfully!')

      setTimeout(() => {
        if (selectedRole === 'candidate') {
          navigate('/candidate/dash')
        } else if (selectedRole === 'recruiter') {
          navigate('/recruiter/dash')
        } else {
          navigate('/candidate/dash')
        }
      }, 1200)
    } catch (err) {
      console.error('Registration Error:', err)
      setError(err.message || 'Registration failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-promo">
        <Logo />
        <div className="promo-content">
          <h1>Your Next Opportunity<br />Awaits</h1>
          <p>Connect with top companies, showcase your skills,<br />
            and take the next step in your career journey.</p>

          <div className="benefits">
            <div><b>⌕</b><span><strong>Find Your Dream Job</strong><small>Explore thousands of opportunities<br />from top companies.</small></span></div>
            <div><b>♧</b><span><strong>Get Noticed</strong><small>Build your profile and let recruiters<br />find you.</small></span></div>
            <div><b>↗</b><span><strong>Grow Your Career</strong><small>Track your applications and<br />achieve your goals.</small></span></div>
          </div>
        </div>
        <div>
          <img className='w-100' src="/image.png" alt="" />
        </div>
      </section>

      <section className="auth-card">
        <div className="top-link">Already have an account? <Link to="/login">Login</Link></div>

        <div className="form-wrapper">
          <Logo />
          <h2>Create Your Account</h2>
          <p className="subtitle">Join thousands of professionals and companies<br />on HireFlow.</p>

          <div className="auth-tabs">
            <Link className="active" to="/signup">Sign Up</Link>
            <Link to="/login">Login</Link>
          </div>

          <div className="role-tabs">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                className={selectedRole === role.id ? 'selected' : ''}
                onClick={() => setSelectedRole(role.id)}
              >
                <span>{role.icon}</span>
                <strong>
                  {role.title}
                  <small>{role.subtitle}</small>
                </strong>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ color: '#d9534f', backgroundColor: '#fdf7f7', border: '1px solid #d9534f', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#06ae79', backgroundColor: '#e6f8f2', border: '1px solid #06ae79', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="♙   Full Name"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="✉   Email Address"
              required
            />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="♧   Phone Number"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="▣   Password (min 8 chars)"
              required
              minLength={8}
            />
    
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account  →'}
            </button>
          </form>

          <div className="divider"><span>or</span></div>
          <button type="button" className="google-btn"><span>Continue with Google</span></button>
          <p className="terms">By signing up, you agree to our <a>Terms of Service</a> and <a>Privacy Policy.</a></p>
        </div>
      </section>
    </main>
  )
}

export default Signup
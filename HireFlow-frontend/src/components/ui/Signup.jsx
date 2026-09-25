import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const Logo = () => (
  <Link to="/" className="auth-logo">
    <img className='w-15 h-15' src="/logo.png" alt="HireFlow Logo" />
    <span>Hire<span>Flow</span></span>
  </Link>
)

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState('candidate')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedRole === 'candidate') {
      navigate('/candidate/dash')
    } else if (selectedRole === 'recruiter') {
      navigate('/recruiter/dash')
    } else {
      navigate('/candidate/dash')
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

          <form onSubmit={handleSubmit}>
            <input placeholder="♙   Full Name" required />
            <input type="email" placeholder="✉   Email Address" required />
            <input type="tel" placeholder="♧   Phone Number" />
            <input type="password" placeholder="▣   Password" required />
            <input placeholder="⌖   Location (City)" />
            <button type="submit" className="submit-btn">Create Account&nbsp; →</button>
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
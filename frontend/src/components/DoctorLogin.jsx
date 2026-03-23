import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'
import Loader from './Loader'

const DoctorLogin = ({ onDoctorLogin, onSwitchToDoctorSignup, onBackToUserLogin }) => {
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('doctorToken', data.token)
        localStorage.setItem('doctor', JSON.stringify(data.doctor))
        setShowLoader(true)
      } else {
        setError(data.message || 'Doctor login failed')
        setLoading(false)
      }
    } catch (apiError) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const handleLoaderComplete = () => {
    const doctorData = JSON.parse(localStorage.getItem('doctor'))
    onDoctorLogin(doctorData)
  }

  if (showLoader) {
    return <Loader message="Signing you in..." subMessage="Opening Doctor Dashboard" onComplete={handleLoaderComplete} />
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button
          type="button"
          className="theme-toggle-auth pullchain-toggle"
          onClick={toggleTheme}
          title={`Pull to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label={`Pull to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <svg className="pullchain-svg" width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
            <g className="bulb-group">
              <rect className="bulb-cap" x="22" y="4" width="20" height="16" rx="3" />
              <path className="bulb-glass" d="M32 20c-11 0-20 9-20 20 0 8 4.2 14.1 11 18.2V60h18v-1.8c6.8-4.1 11-10.2 11-18.2 0-11-9-20-20-20z" />
              <path className="bulb-highlight" d="M25 30c-5 3-7 8-6.5 13.5 0.2 2.3 1 4.3 2.2 6.1" />
              <path className="bulb-filament" d="M26 38c3 0 4-4 6-4s3 4 6 4 3-4 6-4" />
            </g>
            <g className="chain-group">
              <circle className="chain-bead" cx="54" cy="10" r="3" />
              <circle className="chain-bead" cx="54" cy="18" r="3" />
              <circle className="chain-bead" cx="54" cy="26" r="3" />
              <circle className="chain-bead" cx="54" cy="34" r="3" />
              <circle className="chain-bead" cx="54" cy="42" r="3" />
              <rect className="chain-weight" x="50" y="46" width="8" height="12" rx="2" />
            </g>
          </svg>
        </button>

        <div className="auth-icon">
          <div className="icon-circle">
            <span>🩺</span>
          </div>
        </div>

        <div className="auth-header">
          <h1>Doctor Login</h1>
          <p>Access your patient dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Doctor Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Doctor'}
          </button>
        </form>

        <div className="auth-footer">
          <p>New doctor? <button onClick={onSwitchToDoctorSignup} className="switch-btn">Create account</button></p>
          <p style={{ marginTop: '0.5rem' }}><button onClick={onBackToUserLogin} className="switch-btn">← Back to User Login</button></p>
        </div>
      </div>
    </div>
  )
}

export default DoctorLogin

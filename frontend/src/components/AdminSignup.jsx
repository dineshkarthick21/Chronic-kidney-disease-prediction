import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'
import Loader from './Loader'

const AdminSignup = ({ onAdminSignup, onSwitchToAdminLogin, onBackToUserLogin }) => {
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminCode: formData.adminCode
        })
      })
      const data = await response.json()
      if (response.ok) {
        // Store admin token in localStorage
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('admin', JSON.stringify(data.admin))
        // Show loader before navigating to dashboard
        setShowLoader(true)
      } else {
        setError(data.message || 'Admin registration failed')
        setLoading(false)
      }
    } catch (error) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const handleLoaderComplete = () => {
    const adminData = JSON.parse(localStorage.getItem('admin'))
    onAdminSignup(adminData)
  }

  if (showLoader) {
    return <Loader message="Creating your account..." subMessage="Go to Admin Dashboard!" onComplete={handleLoaderComplete} />
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="theme-toggle-auth" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <div className="auth-icon">
          <div className="icon-circle">
            <span>🛡️</span>
          </div>
        </div>
        
        <div className="auth-header">
          <h1>Admin Registration</h1>
          <p>Create your Admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <div className="input-with-icon">
              <span className="input-icon">@</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adminCode">Admin Secret Code</label>
            <div className="input-with-icon">
              <span className="input-icon">🔑</span>
              <input
                type="password"
                id="adminCode"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                placeholder="Enter admin secret code"
                required
              />
            </div>
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
              Contact system administrator for the secret code
            </small>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an admin account? <button onClick={onSwitchToAdminLogin} className="switch-btn">Sign in here</button></p>
          <p style={{ marginTop: '0.5rem' }}><button onClick={onBackToUserLogin} className="switch-btn">← Back to User Login</button></p>
        </div>
      </div>
    </div>
  )
}

export default AdminSignup

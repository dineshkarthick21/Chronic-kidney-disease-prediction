import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'
import Loader from './Loader'

const AdminLogin = ({ onAdminLogin, onSwitchToAdminSignup, onBackToUserLogin }) => {
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

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        // Store admin token in localStorage
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('admin', JSON.stringify(data.admin))
        // Show loader before navigating to dashboard
        setShowLoader(true)
      } else {
        setError(data.message || 'Admin login failed')
        setLoading(false)
      }
    } catch (error) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const handleLoaderComplete = () => {
    const adminData = JSON.parse(localStorage.getItem('admin'))
    onAdminLogin(adminData)
  }

  if (showLoader) {
    return <Loader message="Signing you in..." subMessage="Go to Admin Dashboard!" onComplete={handleLoaderComplete} />
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
          <h1>Admin Portal</h1>
          <p>Sign in to Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
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
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an admin account? <button onClick={onSwitchToAdminSignup} className="switch-btn">Sign up here</button></p>
          <p style={{ marginTop: '0.5rem' }}><button onClick={onBackToUserLogin} className="switch-btn">← Back to User Login</button></p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

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
    return <Loader message="Admin Login Successful..." subMessage="Welcome to Dashboard!" onComplete={handleLoaderComplete} />
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="theme-toggle-auth" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="admin-login-btn" onClick={onBackToUserLogin}>
          User Login
        </button>
        <div className="auth-header">
          <h1>🔐 Admin Login</h1>
          <p>Sign in to your Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an admin account? <button onClick={onSwitchToAdminSignup} className="switch-btn">Sign up</button></p>
        </div>
      </div>

      <div className="auth-illustration">
        <div className="illustration-content">
          <h2>🛡️ Admin Dashboard</h2>
          <p>Manage users, monitor predictions, and analyze data</p>
          <div className="features">
            <div className="feature-item">✓ User Management</div>
            <div className="feature-item">✓ Prediction Analytics</div>
            <div className="feature-item">✓ System Monitoring</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

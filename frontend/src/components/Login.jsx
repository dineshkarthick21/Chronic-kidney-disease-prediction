import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'
import Loader from './Loader'

const Login = ({ onLogin, onSwitchToSignup, onSwitchToAdmin }) => {
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
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
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Show loader before navigating to home
        setShowLoader(true)
        // Loader will automatically call onLogin after animation
      } else {
        setError(data.message || 'Login failed')
        setLoading(false)
      }
    } catch (error) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const handleLoaderComplete = () => {
    const userData = JSON.parse(localStorage.getItem('user'))
    onLogin(userData)
  }

  if (showLoader) {
    return <Loader message="Signing you in..." subMessage="Go to Student Dashboard!" onComplete={handleLoaderComplete} />
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="theme-toggle-auth" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <div className="auth-icon">
          <div className="icon-circle">
            <span>📖</span>
          </div>
        </div>
        
        <div className="auth-header">
          <h1>Welcome Back!</h1>
          <p>Sign in to CKD Predictor</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="role-selector">
            <label className="role-label">Sign in as</label>
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
              >
                User
              </button>
              <button
                type="button"
                className="role-tab"
                onClick={onSwitchToAdmin}
              >
                Admin
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">@</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
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
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onSwitchToSignup} className="switch-btn">Sign up here</button></p>
        </div>
      </div>
    </div>
  )
}

export default Login

import { useState } from 'react'
import './Auth.css'

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    // Simulate API call
    setTimeout(() => {
      if (formData.email && formData.password) {
        // Mock successful login
        onLogin({ email: formData.email, name: formData.email.split('@')[0] })
      } else {
        setError('Please fill in all fields')
      }
      setLoading(false)
    }, 1000)

    // Actual implementation:
    // try {
    //   const response = await fetch('http://localhost:5000/api/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    //   })
    //   const data = await response.json()
    //   if (response.ok) {
    //     onLogin(data.user)
    //   } else {
    //     setError(data.message || 'Login failed')
    //   }
    // } catch (error) {
    //   setError('Connection error. Please try again.')
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your CKD Prediction account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              required
            />
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
          <p>Don't have an account? <button onClick={onSwitchToSignup} className="switch-btn">Sign up</button></p>
        </div>
      </div>

      <div className="auth-illustration">
        <div className="illustration-content">
          <h2>🏥 CKD Prediction System</h2>
          <p>Advanced machine learning for chronic kidney disease prediction</p>
          <div className="features">
            <div className="feature-item">✓ Accurate predictions</div>
            <div className="feature-item">✓ Easy-to-use interface</div>
            <div className="feature-item">✓ Secure data handling</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

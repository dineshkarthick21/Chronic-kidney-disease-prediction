import { useState } from 'react'
import './Auth.css'

const SignUp = ({ onSignUp, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      if (formData.name && formData.email && formData.password) {
        // Mock successful signup
        onSignUp({ email: formData.email, name: formData.name })
      } else {
        setError('Please fill in all fields')
      }
      setLoading(false)
    }, 1000)

    // Actual implementation:
    // try {
    //   const response = await fetch('http://localhost:5000/api/signup', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       name: formData.name,
    //       email: formData.email,
    //       password: formData.password
    //     })
    //   })
    //   const data = await response.json()
    //   if (response.ok) {
    //     onSignUp(data.user)
    //   } else {
    //     setError(data.message || 'Signup failed')
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
          <h1>Create Account</h1>
          <p>Join CKD Prediction System today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
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
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div className="terms">
            <label>
              <input type="checkbox" required />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button onClick={onSwitchToLogin} className="switch-btn">Sign in</button></p>
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

export default SignUp

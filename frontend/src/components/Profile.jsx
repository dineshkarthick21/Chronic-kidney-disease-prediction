import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Profile.css'

function Profile({ user, onBack, onUpdateUser }) {
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  })
  const [notification, setNotification] = useState(null)

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    })
  }, [user])
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = () => {
    // Update localStorage
    const updatedUser = { ...user, ...formData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // Update parent component state
    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }
    
    setIsEditing(false)
    setNotification({ type: 'success', message: 'Profile updated successfully!' })
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match!' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setNotification({ type: 'error', message: 'Password must be at least 6 characters!' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    // TODO: Add API call to change password
    console.log('Changing password')
    
    setShowPasswordChange(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setNotification({ type: 'success', message: 'Password updated successfully!' })
    
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="profile-header">
          <div className="profile-header-left">
            <button className="back-btn" onClick={onBack}>
              ← Back
            </button>
            <h1>Profile</h1>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="change-photo-btn">Change Photo</button>
          </div>

          {/* Profile Information */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p>{formData.name || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p>{formData.email || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone"
                  />
                ) : (
                  <p>{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item full-width">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                ) : (
                  <p>{formData.bio || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="profile-security-section">
            <h2>Account Security</h2>
            {!showPasswordChange ? (
              <button 
                className="change-password-btn" 
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
              </button>
            ) : (
              <div className="password-change-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="password-actions">
                  <button 
                    className="cancel-btn" 
                    onClick={() => setShowPasswordChange(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn" 
                    onClick={handleChangePassword}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="profile-stats-section">
            <h2>Account Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">0</div>
                <div className="stat-label">Predictions Made</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-value">0</div>
                <div className="stat-label">Reports Generated</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🕒</div>
                <div className="stat-value">0 days</div>
                <div className="stat-label">Account Age</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

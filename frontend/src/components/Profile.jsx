import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Profile.css'

function Profile({ user, onBack, onUpdateUser }) {
  const { theme } = useTheme()
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePhoto || ''
  })
  const [statistics, setStatistics] = useState({
    predictions_count: 0,
    reports_count: 0,
    account_age: 0
  })
  const [notification, setNotification] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Fetch user profile and statistics from backend
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
          profilePhoto: data.user.profilePhoto || ''
        })
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Image size must be less than 5MB')
      return
    }

    setUploadingPhoto(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result

        // Upload to backend
        const token = localStorage.getItem('token')
        if (!token) {
          showNotification('error', 'Please login again')
          setUploadingPhoto(false)
          return
        }

        const response = await fetch('http://localhost:5000/api/user/profile-photo', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profilePhoto: base64String })
        })

        const data = await response.json()

        if (response.ok) {
          // Update local state
          setFormData(prev => ({ ...prev, profilePhoto: base64String }))
          
          // Update localStorage and parent state
          const updatedUser = { ...user, profilePhoto: base64String }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          if (onUpdateUser) {
            onUpdateUser(updatedUser)
          }
          
          showNotification('success', 'Profile photo updated successfully!')
        } else {
          showNotification('error', data.message || 'Failed to upload photo')
        }
      }

      reader.onerror = () => {
        showNotification('error', 'Failed to read image file')
      }

      reader.readAsDataURL(file)
    } catch (error) {
      showNotification('error', 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

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

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showNotification('error', 'Please login again')
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Update localStorage
        const updatedUser = { ...user, ...data.user }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update parent component state
        if (onUpdateUser) {
          onUpdateUser(updatedUser)
        }
        
        setIsEditing(false)
        showNotification('success', 'Profile updated successfully!')
      } else {
        showNotification('error', data.message || 'Failed to update profile')
      }
    } catch (error) {
      showNotification('error', 'Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'Passwords do not match!')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters!')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showNotification('error', 'Please login again')
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowPasswordChange(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        showNotification('success', 'Password updated successfully!')
      } else {
        showNotification('error', data.message || 'Failed to change password')
      }
    } catch (error) {
      showNotification('error', 'Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
              {formData.profilePhoto ? (
                <img 
                  src={formData.profilePhoto} 
                  alt="Profile" 
                  className="profile-photo-img"
                />
              ) : (
                formData.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <h2 className="profile-name">{formData.name}</h2>
            <p className="profile-email">{formData.email}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <button 
              className="change-photo-btn" 
              onClick={handlePhotoClick}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>

          {/* Profile Information */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)} disabled={isLoading}>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
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
                disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn" 
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
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
                <div className="stat-value">{statistics.predictions_count}</div>
                <div className="stat-label">Predictions Made</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-value">{statistics.reports_count}</div>
                <div className="stat-label">Reports Generated</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🕒</div>
                <div className="stat-value">{statistics.account_age} {statistics.account_age === 1 ? 'day' : 'days'}</div>
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

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Settings.css'

function Settings({ user, onBack }) {
  const { theme, toggleTheme } = useTheme()
  const [notification, setNotification] = useState(null)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    weeklyReports: true,
    twoFactorAuth: false,
    autoSave: true,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    dataSharing: false
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setNotification({ type: 'success', message: 'Settings saved successfully!' })
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: Are you sure you want to delete your account?\n\n' +
      'This action will:\n' +
      '• Permanently delete all your data\n' +
      '• Remove all your predictions and reports\n' +
      '• Cannot be undone\n\n' +
      'Type "DELETE" in the prompt to confirm.'
    )
    
    if (confirmed) {
      const confirmText = prompt('Type DELETE to confirm account deletion:')
      
      if (confirmText === 'DELETE') {
        // TODO: Add API call to delete account
        console.log('Deleting account')
        setNotification({ 
          type: 'success', 
          message: 'Account deletion requested. You will be logged out shortly.' 
        })
        
        // Simulate account deletion
        setTimeout(() => {
          localStorage.clear()
          window.location.reload()
        }, 2000)
      } else {
        setNotification({ 
          type: 'error', 
          message: 'Account deletion cancelled. Confirmation text did not match.' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="settings-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1>Settings</h1>
        </div>

        <div className="settings-content">
          {/* Appearance Settings */}
          <div className="settings-section">
            <div className="section-title">
              <span className="section-icon">🎨</span>
              <h2>Appearance</h2>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Theme</h3>
                  <p>Choose between light and dark mode</p>
                </div>
                <button 
                  className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={toggleTheme}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <div className="section-title">
              <span className="section-icon">🔔</span>
              <h2>Notifications</h2>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Email Notifications</h3>
                  <p>Receive email updates about your predictions</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.emailNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('emailNotifications')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Push Notifications</h3>
                  <p>Get notified about important updates</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.pushNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('pushNotifications')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Marketing Emails</h3>
                  <p>Receive news and promotional content</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.marketingEmails ? 'active' : ''}`}
                  onClick={() => handleToggle('marketingEmails')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Weekly Reports</h3>
                  <p>Get weekly summaries of your activity</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.weeklyReports ? 'active' : ''}`}
                  onClick={() => handleToggle('weeklyReports')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-section">
            <div className="section-title">
              <span className="section-icon">🔒</span>
              <h2>Security</h2>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.twoFactorAuth ? 'active' : ''}`}
                  onClick={() => handleToggle('twoFactorAuth')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <div className="section-title">
              <span className="section-icon">⚙️</span>
              <h2>Preferences</h2>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Language</h3>
                  <p>Choose your preferred language</p>
                </div>
                <select 
                  className="setting-select"
                  value={settings.language}
                  onChange={(e) => handleSelectChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Date Format</h3>
                  <p>Choose how dates are displayed</p>
                </div>
                <select 
                  className="setting-select"
                  value={settings.dateFormat}
                  onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Auto-Save</h3>
                  <p>Automatically save your work</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.autoSave ? 'active' : ''}`}
                  onClick={() => handleToggle('autoSave')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-section">
            <div className="section-title">
              <span className="section-icon">🔐</span>
              <h2>Privacy</h2>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Data Sharing</h3>
                  <p>Allow anonymous data collection for research</p>
                </div>
                <button 
                  className={`toggle-btn ${settings.dataSharing ? 'active' : ''}`}
                  onClick={() => handleToggle('dataSharing')}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button className="save-settings-btn" onClick={handleSaveSettings}>
              Save All Settings
            </button>
            <button className="delete-account-btn" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

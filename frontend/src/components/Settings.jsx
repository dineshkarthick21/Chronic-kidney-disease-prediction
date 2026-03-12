import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Settings.css'

function Settings({ user, onBack }) {
  const { theme, toggleTheme } = useTheme()
  const [notification, setNotification] = useState(null)
  const [activeTab, setActiveTab] = useState('appearance')
  const [isLoading, setIsLoading] = useState(false)
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme,
    fontSize: 'medium',
    compactMode: false,
    highContrast: false,
    language: 'en'
  })

  // Preferences settings
  const [preferencesSettings, setPreferencesSettings] = useState({
    autoSave: true,
    defaultView: 'single',
    showTutorials: true,
    soundEffects: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    resultsPerPage: 10
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '30',
    requirePasswordChange: false,
    loginAlerts: true,
    deviceTracking: true
  })

  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearanceSettings')
    const savedPreferences = localStorage.getItem('preferencesSettings')
    const savedSecurity = localStorage.getItem('securitySettings')
    
    if (savedAppearance) setAppearanceSettings(JSON.parse(savedAppearance))
    if (savedPreferences) setPreferencesSettings(JSON.parse(savedPreferences))
    if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity))
  }, [])

  // Sync theme with appearance settings
  useEffect(() => {
    setAppearanceSettings(prev => ({ ...prev, theme }))
  }, [theme])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleThemeToggle = () => {
    toggleTheme()
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setAppearanceSettings(prev => ({ ...prev, theme: newTheme }))
  }

  const handleAppearanceChange = (setting, value) => {
    setAppearanceSettings(prev => ({ ...prev, [setting]: value }))
  }

  const handlePreferencesChange = (setting, value) => {
    setPreferencesSettings(prev => ({ ...prev, [setting]: value }))
  }

  const handleSecurityChange = (setting, value) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }))
  }

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target
    setPasswordChange(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = () => {
    setIsLoading(true)
    
    // Save to localStorage
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings))
    localStorage.setItem('preferencesSettings', JSON.stringify(preferencesSettings))
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings))

    setTimeout(() => {
      setIsLoading(false)
      showNotification('success', 'Settings saved successfully!')
    }, 500)
  }

  const handleChangePassword = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
      showNotification('error', 'Please fill in all password fields')
      return
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      showNotification('error', 'New passwords do not match')
      return
    }

    if (passwordChange.newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' })
        showNotification('success', 'Password changed successfully!')
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
          <h1>⚙️ Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span className="tab-icon">🎨</span>
            <span>Appearance</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span className="tab-icon">⚙️</span>
            <span>Preferences</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="tab-icon">🔒</span>
            <span>Security</span>
          </button>
        </div>

        <div className="settings-content">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-section active">
              <div className="section-header">
                <h2>🎨 Appearance Settings</h2>
                <p>Customize the look and feel of your dashboard</p>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🌓 Theme Mode</h3>
                    <p>Switch between light and dark theme</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={handleThemeToggle}
                    >
                      <span className="theme-option">☀️ Light</span>
                      <span className="theme-option">🌙 Dark</span>
                      <span className="theme-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📏 Font Size</h3>
                    <p>Adjust text size for better readability</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={appearanceSettings.fontSize}
                      onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📦 Compact Mode</h3>
                    <p>Reduce spacing for more content on screen</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${appearanceSettings.compactMode ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('compactMode', !appearanceSettings.compactMode)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🔆 High Contrast</h3>
                    <p>Increase contrast for better visibility</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${appearanceSettings.highContrast ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('highContrast', !appearanceSettings.highContrast)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🌍 Language</h3>
                    <p>Choose your preferred language</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={appearanceSettings.language}
                      onChange={(e) => handleAppearanceChange('language', e.target.value)}
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Spanish</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="de">🇩🇪 German</option>
                      <option value="zh">🇨🇳 Chinese</option>
                      <option value="ja">🇯🇵 Japanese</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section active">
              <div className="section-header">
                <h2>⚙️ Preference Settings</h2>
                <p>Customize your dashboard behavior and defaults</p>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>💾 Auto-Save</h3>
                    <p>Automatically save your work and settings</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${preferencesSettings.autoSave ? 'active' : ''}`}
                      onClick={() => handlePreferencesChange('autoSave', !preferencesSettings.autoSave)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🏠 Default View</h3>
                    <p>Choose which prediction type opens by default</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={preferencesSettings.defaultView}
                      onChange={(e) => handlePreferencesChange('defaultView', e.target.value)}
                    >
                      <option value="single">Single Prediction</option>
                      <option value="csv">CSV Upload</option>
                    </select>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🎓 Show Tutorials</h3>
                    <p>Display helpful tips and guides</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${preferencesSettings.showTutorials ? 'active' : ''}`}
                      onClick={() => handlePreferencesChange('showTutorials', !preferencesSettings.showTutorials)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🔊 Sound Effects</h3>
                    <p>Play sounds for notifications and actions</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${preferencesSettings.soundEffects ? 'active' : ''}`}
                      onClick={() => handlePreferencesChange('soundEffects', !preferencesSettings.soundEffects)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📅 Date Format</h3>
                    <p>Choose how dates are displayed</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={preferencesSettings.dateFormat}
                      onChange={(e) => handlePreferencesChange('dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🕐 Time Format</h3>
                    <p>12-hour or 24-hour time display</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={preferencesSettings.timeFormat}
                      onChange={(e) => handlePreferencesChange('timeFormat', e.target.value)}
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📊 Results Per Page</h3>
                    <p>Number of items to display per page</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={preferencesSettings.resultsPerPage}
                      onChange={(e) => handlePreferencesChange('resultsPerPage', parseInt(e.target.value))}
                    >
                      <option value="5">5 items</option>
                      <option value="10">10 items</option>
                      <option value="20">20 items</option>
                      <option value="50">50 items</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section active">
              <div className="section-header">
                <h2>🔒 Security Settings</h2>
                <p>Manage your account security and privacy</p>
              </div>

              <div className="settings-list">
                {/* Password Change Section */}
                <div className="security-card">
                  <h3>🔑 Change Password</h3>
                  <p className="card-description">Update your password to keep your account secure</p>
                  
                  <div className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordChange.currentPassword}
                        onChange={handlePasswordChangeInput}
                        placeholder="Enter current password"
                        className="password-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordChange.newPassword}
                        onChange={handlePasswordChangeInput}
                        placeholder="Enter new password (min 6 characters)"
                        className="password-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordChange.confirmPassword}
                        onChange={handlePasswordChangeInput}
                        placeholder="Re-enter new password"
                        className="password-input"
                      />
                    </div>
                    <button 
                      className="change-password-btn" 
                      onClick={handleChangePassword}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>⏱️ Session Timeout</h3>
                    <p>Auto logout after period of inactivity</p>
                  </div>
                  <div className="setting-control">
                    <select 
                      className="setting-select"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🔔 Login Alerts</h3>
                    <p>Get notified of new login attempts</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${securitySettings.loginAlerts ? 'active' : ''}`}
                      onClick={() => handleSecurityChange('loginAlerts', !securitySettings.loginAlerts)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📱 Device Tracking</h3>
                    <p>Track devices used to access your account</p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`toggle-btn ${securitySettings.deviceTracking ? 'active' : ''}`}
                      onClick={() => handleSecurityChange('deviceTracking', !securitySettings.deviceTracking)}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button 
              className="save-settings-btn" 
              onClick={handleSaveSettings}
              disabled={isLoading}
            >
              {isLoading ? '💾 Saving...' : '💾 Save All Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Header.css'

function Header({ user, onLogout, onNavigateToProfile, onNavigateToSettings, onNavigateToReports, onOpenAIChat, onNavigateToConsultation, onNavigateToEducation }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const dropdownRef = useRef(null)
  const moreDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setShowMoreDropdown(false)
      }
    }

    if (showDropdown || showMoreDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown, showMoreDropdown])

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">CKD Predict</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="nav-section">
          {/* Theme Toggle */}
          <button
            type="button"
            className="theme-toggle pullchain-toggle"
            onClick={toggleTheme}
            title={`Pull to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Pull to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <svg className="pullchain-svg" width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
              <g className="bulb-group">
                <rect className="bulb-cap" x="22" y="4" width="20" height="16" rx="3" />
                <path
                  className="bulb-glass"
                  d="M32 20c-11 0-20 9-20 20 0 8 4.2 14.1 11 18.2V60h18v-1.8c6.8-4.1 11-10.2 11-18.2 0-11-9-20-20-20z"
                />
                <path className="bulb-highlight" d="M25 30c-5 3-7 8-6.5 13.5 0.2 2.3 1 4.3 2.2 6.1" />
                <path className="bulb-filament" d="M26 38c3 0 4-4 6-4s3 4 6 4 3-4 6-4" />
              </g>

              <g className="chain-group">
                <circle className="chain-bead" cx="54" cy="10" r="3" />
                <circle className="chain-bead" cx="54" cy="18" r="3" />
                <circle className="chain-bead" cx="54" cy="26" r="3" />
                <circle className="chain-bead" cx="54" cy="34" r="3" />
                <circle className="chain-bead" cx="54" cy="42" r="3" />
                <rect className="chain-weight" x="50" y="46" width="8" height="12" rx="2" />
              </g>
            </svg>
          </button>

          {user && (
            <div className="user-profile" ref={dropdownRef}>
              <button className="profile-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="user-avatar-img" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="user-name">{user.name || user.email}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                </svg>
              </button>
              {showDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="user-avatar-img" />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name-large">{user.name || 'User'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => { onNavigateToProfile(); setShowDropdown(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                      <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                    </svg>
                    Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { onNavigateToSettings(); setShowDropdown(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                      <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2" strokeWidth="2"/>
                    </svg>
                    Settings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={() => { onLogout(); setShowDropdown(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/>
                      <polyline points="16 17 21 12 16 7" strokeWidth="2"/>
                      <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          
          {user && (
            <div className="more-menu" ref={moreDropdownRef}>
              <button className="nav-item" onClick={() => setShowMoreDropdown(!showMoreDropdown)}>
                <span>More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                </svg>
              </button>
              {showMoreDropdown && (
                <div className="more-dropdown">
                  <button className="dropdown-item" onClick={() => { onNavigateToEducation(); setShowMoreDropdown(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2"/>
                    </svg>
                    Health Education
                  </button>
                  <button className="dropdown-item" onClick={() => { onNavigateToConsultation(); setShowMoreDropdown(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2"/>
                    </svg>
                    Doctor Consultation
                  </button>
                  <button className="dropdown-item" onClick={() => { onOpenAIChat(); setShowMoreDropdown(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/>
                    </svg>
                    AI Chat Assistant
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button className="nav-item cart" onClick={onNavigateToReports}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 2L7 6h10l-2-4" strokeWidth="2"/>
              <path d="M7 6h10l1 14H6L7 6z" strokeWidth="2"/>
            </svg>
            <span>Reports</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

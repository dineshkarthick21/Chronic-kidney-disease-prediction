import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Header.css'

function Header({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

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

        {/* Search Section */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for medical records, reports and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="nav-section">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5" strokeWidth="2"/>
                <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2"/>
                <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2"/>
                <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2"/>
                <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2"/>
              </svg>
            )}
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          {user && (
            <div className="user-profile" ref={dropdownRef}>
              <button className="profile-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
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
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                      <div className="user-name-large">{user.name || 'User'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                      <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                    </svg>
                    Profile
                  </button>
                  <button className="dropdown-item">
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
          
          <button className="nav-item">
            <span>More</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
            </svg>
          </button>
          
          <button className="nav-item cart">
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

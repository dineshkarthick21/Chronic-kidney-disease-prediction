import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import './Header.css'

function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme } = useTheme()

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

          <button className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
            <span>Login</span>
          </button>
          
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

      {/* Sub Header - Location/Info Bar */}
      <div className="sub-header">
        <div className="sub-header-container">
          <div className="location-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="location-text">Healthcare Location not set</span>
            <a href="#" className="location-link">Select your location</a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

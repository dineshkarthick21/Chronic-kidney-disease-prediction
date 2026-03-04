import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import PredictionForm from './components/PredictionForm'
import CSVUpload from './components/CSVUpload'
import Results from './components/Results'
import Login from './components/Login'
import SignUp from './components/SignUp'
import AdminLogin from './components/AdminLogin'
import AdminSignup from './components/AdminSignup'
import AdminDashboard from './components/AdminDashboard'
import Loader from './components/Loader'
import LandingPage from './components/LandingPage'
import Profile from './components/Profile'
import Settings from './components/Settings'
import AIChatAssistant from './components/AIChatAssistant'

function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [authView, setAuthView] = useState('login') // 'login', 'signup', 'adminLogin', 'adminSignup'
  const [showLanding, setShowLanding] = useState(true) // Show landing page by default
  const [loggingOut, setLoggingOut] = useState(false)
  const [currentView, setCurrentView] = useState('main') // 'main', 'profile', 'settings'
  const [showAIChat, setShowAIChat] = useState(false) // AI Chat Assistant state

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleSignUp = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      setUser(null)
      localStorage.removeItem('user')
      setResults(null)
      setLoggingOut(false)
      setAuthView('login')
      setShowLanding(true) // Go back to landing page after logout
    }, 1500)
  }

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData)
    localStorage.setItem('admin', JSON.stringify(adminData))
  }

  const handleAdminSignup = (adminData) => {
    setAdmin(adminData)
    localStorage.setItem('admin', JSON.stringify(adminData))
  }

  const handleAdminLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      setAdmin(null)
      localStorage.removeItem('admin')
      localStorage.removeItem('adminToken')
      setLoggingOut(false)
      setAuthView('login')
      setShowLanding(true) // Go back to landing page after logout
    }, 1500)
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAdmin = localStorage.getItem('admin')
    
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
      setShowLanding(false) // Don't show landing if user is already logged in
    } else if (savedUser) {
      setUser(JSON.parse(savedUser))
      setShowLanding(false) // Don't show landing if user is already logged in
    }
  }, [])

  // Show loading page during logout
  if (loggingOut) {
    return <Loader message="Logging out..." subMessage="Please wait" />
  }

  // If admin is authenticated, show admin dashboard
  if (admin) {
    return <AdminDashboard admin={admin} onLogout={handleAdminLogout} />
  }

  // If not authenticated, show landing page or auth views
  if (!user) {
    // Show landing page first
    if (showLanding) {
      return (
        <LandingPage
          onGetStarted={() => {
            setShowLanding(false)
            setAuthView('signup')
          }}
          onSignIn={() => {
            setShowLanding(false)
            setAuthView('login')
          }}
        />
      )
    }

    // Show auth views after landing page
    if (authView === 'login') {
      return (
        <Login 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setAuthView('signup')}
          onSwitchToAdmin={() => setAuthView('adminLogin')}
        />
      )
    } else if (authView === 'signup') {
      return (
        <SignUp 
          onSignUp={handleSignUp} 
          onSwitchToLogin={() => setAuthView('login')} 
          onSwitchToAdminSignup={() => setAuthView('adminSignup')}
        />
      )
    } else if (authView === 'adminLogin') {
      return (
        <AdminLogin
          onAdminLogin={handleAdminLogin}
          onSwitchToAdminSignup={() => setAuthView('adminSignup')}
          onBackToUserLogin={() => setAuthView('login')}
        />
      )
    } else if (authView === 'adminSignup') {
      return (
        <AdminSignup
          onAdminSignup={handleAdminSignup}
          onSwitchToAdminLogin={() => setAuthView('adminLogin')}
          onBackToUserLogin={() => setAuthView('login')}
        />
      )
    }
  }

  return (
    <div className="app">
      {/* AI Chat Assistant Overlay */}
      {showAIChat && <AIChatAssistant onClose={() => setShowAIChat(false)} />}
      
      {currentView === 'profile' ? (
        <Profile user={user} onBack={() => setCurrentView('main')} />
      ) : currentView === 'settings' ? (
        <Settings user={user} onBack={() => setCurrentView('main')} />
      ) : (
        <>
          <Header 
            user={user} 
            onLogout={handleLogout}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToSettings={() => setCurrentView('settings')}
            onOpenAIChat={() => setShowAIChat(true)}
          />
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setResults={setResults} />

          <main className="main-content">
            {!results ? (
              <>
                {activeTab === 'single' && <PredictionForm setResults={setResults} />}
                {activeTab === 'csv' && <CSVUpload setResults={setResults} />}
              </>
            ) : (
              <Results results={results} setResults={setResults} />
            )}
          </main>

          <footer className="app-footer">
            <p>© 2026 CKD Prediction. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  )
}

export default App

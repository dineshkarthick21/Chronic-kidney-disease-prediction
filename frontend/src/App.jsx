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
import DoctorLogin from './components/DoctorLogin'
import DoctorSignup from './components/DoctorSignup'
import DoctorDashboard from './components/DoctorDashboard'
import Loader from './components/Loader'
import LandingPage from './components/LandingPage'
import Profile from './components/Profile'
import Settings from './components/Settings'
import AIChatAssistant from './components/AIChatAssistant'
import Reports from './components/Reports'
import DoctorConsultation from './components/DoctorConsultation'
import HealthEducation from './components/HealthEducation'

function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [authView, setAuthView] = useState('login') // 'login', 'signup', 'adminLogin', 'adminSignup', 'doctorLogin', 'doctorSignup'
  const [showLanding, setShowLanding] = useState(true) // Show landing page by default
  const [loggingOut, setLoggingOut] = useState(false)
  const [currentView, setCurrentView] = useState('main') // 'main', 'profile', 'settings', 'reports', 'consultation', 'education'
  const [showAIChat, setShowAIChat] = useState(false) // AI Chat Assistant state

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleSignUp = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
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

  const handleDoctorLogin = (doctorData) => {
    setDoctor(doctorData)
    localStorage.setItem('doctor', JSON.stringify(doctorData))
  }

  const handleDoctorSignup = (doctorData) => {
    setDoctor(doctorData)
    localStorage.setItem('doctor', JSON.stringify(doctorData))
  }

  const handleDoctorLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      setDoctor(null)
      localStorage.removeItem('doctor')
      localStorage.removeItem('doctorToken')
      setLoggingOut(false)
      setAuthView('login')
      setShowLanding(true)
    }, 1500)
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAdmin = localStorage.getItem('admin')
    const savedDoctor = localStorage.getItem('doctor')
    
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
      setShowLanding(false) // Don't show landing if user is already logged in
    } else if (savedDoctor) {
      setDoctor(JSON.parse(savedDoctor))
      setShowLanding(false)
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

  if (doctor) {
    return <DoctorDashboard doctor={doctor} onLogout={handleDoctorLogout} />
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
          onSwitchToDoctor={() => setAuthView('doctorLogin')}
        />
      )
    } else if (authView === 'signup') {
      return (
        <SignUp 
          onSignUp={handleSignUp} 
          onSwitchToLogin={() => setAuthView('login')} 
          onSwitchToAdminSignup={() => setAuthView('adminSignup')}
          onSwitchToDoctorSignup={() => setAuthView('doctorSignup')}
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
    } else if (authView === 'doctorLogin') {
      return (
        <DoctorLogin
          onDoctorLogin={handleDoctorLogin}
          onSwitchToDoctorSignup={() => setAuthView('doctorSignup')}
          onBackToUserLogin={() => setAuthView('login')}
        />
      )
    } else if (authView === 'doctorSignup') {
      return (
        <DoctorSignup
          onDoctorSignup={handleDoctorSignup}
          onSwitchToDoctorLogin={() => setAuthView('doctorLogin')}
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
        <Profile 
          user={user} 
          onBack={() => setCurrentView('main')} 
          onUpdateUser={handleUpdateUser}
        />
      ) : currentView === 'settings' ? (
        <Settings 
          user={user} 
          onBack={() => setCurrentView('main')} 
        />
      ) : currentView === 'reports' ? (
        <Reports 
          user={user} 
          onBack={() => setCurrentView('main')}
        />
      ) : currentView === 'consultation' ? (
        <DoctorConsultation
          user={user}
          onBack={() => setCurrentView('main')}
        />
      ) : currentView === 'education' ? (
        <HealthEducation
          user={user}
          onBack={() => setCurrentView('main')}
        />
      ) : (
        <>
          <Header 
            user={user} 
            onNavigateToEducation={() => setCurrentView('education')}
            onLogout={handleLogout}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToSettings={() => setCurrentView('settings')}
            onNavigateToReports={() => setCurrentView('reports')}
            onNavigateToConsultation={() => setCurrentView('consultation')}
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

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

function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [authView, setAuthView] = useState('login') // 'login', 'signup', 'adminLogin', 'adminSignup'

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleSignUp = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setResults(null)
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
    setAdmin(null)
    localStorage.removeItem('admin')
    localStorage.removeItem('adminToken')
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAdmin = localStorage.getItem('admin')
    
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
    } else if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // If admin is authenticated, show admin dashboard
  if (admin) {
    return <AdminDashboard admin={admin} onLogout={handleAdminLogout} />
  }

  // If not authenticated, show login/signup
  if (!user) {
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
      <Header user={user} onLogout={handleLogout} />
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
    </div>
  )
}

export default App

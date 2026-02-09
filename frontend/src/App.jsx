import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import PredictionForm from './components/PredictionForm'
import CSVUpload from './components/CSVUpload'
import Results from './components/Results'
import Login from './components/Login'
import SignUp from './components/SignUp'

function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('login') // 'login' or 'signup'

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

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // If not authenticated, show login/signup
  if (!user) {
    return authView === 'login' ? (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setAuthView('signup')} 
      />
    ) : (
      <SignUp 
        onSignUp={handleSignUp} 
        onSwitchToLogin={() => setAuthView('login')} 
      />
    )
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

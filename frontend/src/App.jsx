import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import PredictionForm from './components/PredictionForm'
import CSVUpload from './components/CSVUpload'
import Results from './components/Results'

function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [results, setResults] = useState(null)

  return (
    <div className="app">
      <Header />
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

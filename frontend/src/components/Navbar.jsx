import './Navbar.css'

function Navbar({ activeTab, setActiveTab, setResults }) {
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setResults(null)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button
          className={`nav-tab ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => handleTabChange('single')}
        >
          Single Prediction
        </button>
        <button
          className={`nav-tab ${activeTab === 'csv' ? 'active' : ''}`}
          onClick={() => handleTabChange('csv')}
        >
          CSV Upload
        </button>
      </div>
    </nav>
  )
}

export default Navbar

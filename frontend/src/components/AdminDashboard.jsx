import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import './AdminDashboard.css'

const AdminDashboard = ({ admin, onLogout }) => {
  const { theme, toggleTheme } = useTheme()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    activeSessions: 0
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUsers, setShowUsers] = useState(false)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPredictions, setUserPredictions] = useState([])
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [breadcrumb, setBreadcrumb] = useState(['Dashboard'])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch users list
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    onLogout()
  }

  const fetchUserPredictions = async (userId, userEmail) => {
    setLoadingPredictions(true)
    try {
      const token = localStorage.getItem('adminToken')
      
      // Fetch user predictions from backend
      const response = await fetch(`http://localhost:5000/api/admin/user-predictions/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserPredictions(data.predictions || [])
      } else {
        setUserPredictions([])
      }
    } catch (error) {
      console.error('Error fetching user predictions:', error)
      setUserPredictions([])
    } finally {
      setLoadingPredictions(false)
    }
  }

  const handleViewDetails = async (user) => {
    setSelectedUser(user)
    setActiveMenu('user-details')
    setBreadcrumb(['Dashboard', 'Users', user.name])
    setActiveTab('overview')
    await fetchUserPredictions(user._id || user.id, user.email)
  }

  const closeModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setUserPredictions([])
  }

  const handleBackToUsers = () => {
    setSelectedUser(null)
    setActiveMenu('users')
    setBreadcrumb(['Dashboard', 'Users'])
    setActiveTab('overview')
  }

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      setActiveMenu('dashboard')
      setBreadcrumb(['Dashboard'])
      setSelectedUser(null)
    } else if (index === 1) {
      setActiveMenu('users')
      setBreadcrumb(['Dashboard', 'Users'])
      setSelectedUser(null)
    }
  }

  // Download user records as PDF
  const handleDownloadRecords = () => {
    if (!selectedUser || !userPredictions) return

    try {
      const doc = new jsPDF()
      
      // Page 1: User Information & Summary
      doc.setFontSize(22)
      doc.setTextColor(41, 128, 185)
      doc.text('User Activity Report', 105, 20, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' })
      
      // User Profile Section
      doc.setFontSize(16)
      doc.setTextColor(41, 128, 185)
      doc.text('User Information', 14, 45)
      
      doc.setFontSize(11)
      doc.setTextColor(0)
      doc.text(`Name: ${selectedUser.name}`, 14, 55)
      doc.text(`Email: ${selectedUser.email}`, 14, 62)
      doc.text(`Joined Date: ${new Date(selectedUser.created_at).toLocaleDateString()}`, 14, 69)
      doc.text(`Status: Active`, 14, 76)
      doc.text(`Total Predictions: ${userPredictions.length}`, 14, 83)
      
      // Summary boxes
      const boxY = 95
      const stats = getPredictionStats()
      
      // Total box
      doc.setFillColor(52, 152, 219)
      doc.rect(14, boxY, 60, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.text(userPredictions.length.toString(), 44, boxY + 12, { align: 'center' })
      doc.setFontSize(10)
      doc.text('Total Predictions', 44, boxY + 20, { align: 'center' })
      
      // CKD Detected box
      doc.setFillColor(231, 76, 60)
      doc.rect(80, boxY, 60, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.text(stats.positive.toString(), 110, boxY + 12, { align: 'center' })
      doc.setFontSize(10)
      doc.text('CKD Detected', 110, boxY + 20, { align: 'center' })
      
      // No CKD box
      doc.setFillColor(46, 204, 113)
      doc.rect(146, boxY, 60, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.text(stats.negative.toString(), 176, boxY + 12, { align: 'center' })
      doc.setFontSize(10)
      doc.text('No CKD', 176, boxY + 20, { align: 'center' })
      
      // Predictions Table
      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('Prediction History', 14, 135)
      
      autoTable(doc, {
        startY: 142,
        head: [['Date', 'Result', 'Confidence', 'Type']],
        body: userPredictions.map(p => [
          new Date(p.created_at).toLocaleDateString(),
          p.result || 'N/A',
          p.confidence ? `${(parseFloat(p.confidence)).toFixed(1)}%` : 'N/A',
          p.type || 'Single'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
        margin: { top: 142 }
      })
      
      // Page 2: Analytics & Insights
      doc.addPage()
      
      doc.setFontSize(18)
      doc.setTextColor(41, 128, 185)
      doc.text('User Analytics & Insights', 105, 20, { align: 'center' })
      
      let yPos = 35
      
      // Activity Timeline
      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('Activity Timeline', 14, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      const activityText = [
        `First Prediction: ${userPredictions.length > 0 ? new Date(userPredictions[0].created_at).toLocaleDateString() : 'N/A'}`,
        `Last Prediction: ${userPredictions.length > 0 ? new Date(userPredictions[userPredictions.length - 1].created_at).toLocaleDateString() : 'N/A'}`,
        `Average Daily Activity: ${(userPredictions.length / 30).toFixed(1)} predictions`,
        `Most Active Day: ${new Date().toLocaleDateString()}`,
      ]
      
      activityText.forEach(line => {
        doc.text(line, 14, yPos)
        yPos += 7
      })
      
      yPos += 10
      
      // Risk Assessment
      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('Health Risk Assessment', 14, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      const ckdPercentage = userPredictions.length > 0 ? (stats.positive / userPredictions.length * 100).toFixed(1) : 0
      
      const assessmentText = [
        `CKD Detection Rate: ${ckdPercentage}%`,
        `Risk Level: ${ckdPercentage > 50 ? 'High' : ckdPercentage > 25 ? 'Moderate' : 'Low'}`,
        `Confidence Average: ${userPredictions.reduce((acc, p) => acc + (parseFloat(p.confidence) || 0), 0) / userPredictions.length || 0}%`,
        '',
        'Recommendations:',
        stats.positive > 0 ? '- Immediate medical consultation recommended' : '- Continue regular health monitoring',
        '- Schedule kidney function tests every 6 months',
        '- Maintain healthy lifestyle and diet',
        '- Monitor blood pressure and blood sugar regularly',
      ]
      
      assessmentText.forEach(line => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 14, yPos)
        yPos += 6
      })
      
      // Page 3: Medical Information
      doc.addPage()
      doc.setFontSize(16)
      doc.setTextColor(41, 128, 185)
      doc.text('Medical Reference Information', 105, 20, { align: 'center' })
      
      autoTable(doc, {
        startY: 30,
        head: [['Parameter', 'Normal Range', 'Description']],
        body: [
          ['Blood Pressure', '120/80 mmHg', 'Optimal cardiovascular health'],
          ['Blood Glucose', '70-100 mg/dL', 'Fasting blood sugar level'],
          ['Serum Creatinine', '0.7-1.3 mg/dL', 'Kidney function indicator'],
          ['Hemoglobin', '12-16 g/dL', 'Oxygen carrying capacity'],
          ['eGFR', '90+ mL/min', 'Kidney filtration rate'],
          ['Albumin', '3.5-5.5 g/dL', 'Protein levels in blood'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9 },
      })
      
      yPos = doc.lastAutoTable.finalY + 15
      
      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('CKD Prevention Guidelines', 14, yPos)
      yPos += 10
      
      doc.setFontSize(9)
      doc.setTextColor(0)
      const guidelines = [
        '1. Maintain healthy blood pressure (below 130/80 mmHg)',
        '2. Control blood sugar levels if diabetic',
        '3. Follow a kidney-friendly diet (low sodium, limited protein)',
        '4. Stay physically active (30 min daily exercise)',
        '5. Avoid smoking and limit alcohol consumption',
        '6. Stay hydrated (8-10 glasses of water daily)',
        '7. Regular health screenings and kidney function tests',
        '8. Maintain healthy weight (BMI 18.5-24.9)',
        '9. Manage stress through meditation and relaxation',
        '10. Take medications as prescribed by healthcare provider',
      ]
      
      guidelines.forEach(line => {
        if (yPos > 275) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 14, yPos, { maxWidth: 180 })
        yPos += 7
      })
      
      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
        doc.text(`Admin Report - ${selectedUser.name} - Generated by CKD Prediction System`, 105, 285, { align: 'center', maxWidth: 180 })
      }
      
      // Save PDF
      doc.save(`user_report_${selectedUser.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  // Remove user handler
  const handleRemoveUser = async () => {
    if (!selectedUser) return

    const confirmDelete = window.confirm(
      `Are you sure you want to remove user "${selectedUser.name}"?\n\nThis action cannot be undone and will delete:\n- User account\n- All prediction history\n- User data\n\nType "DELETE" to confirm.`
    )

    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id || selectedUser.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert(`User "${selectedUser.name}" has been successfully removed.`)
        // Refresh data and go back to users list
        await fetchDashboardData()
        handleBackToUsers()
      } else {
        const errorData = await response.json()
        alert(`Failed to remove user: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error removing user:', error)
      alert('Failed to remove user. Please try again.')
    }
  }

  // Calculate prediction statistics
  const getPredictionStats = () => {
    const negative = userPredictions.filter(p => p.result === 'No CKD' || p.result === 'negative' || p.result === 'notckd').length
    const positive = userPredictions.filter(p => p.result === 'CKD' || p.result === 'positive' || p.result === 'ckd').length
    const pending = userPredictions.filter(p => !p.result || p.result === 'pending').length
    
    return { negative, positive, pending }
  }

  // Prepare data for pie chart
  const getPieChartData = () => {
    const stats = getPredictionStats()
    return [
      { name: 'Negative', value: stats.negative, color: '#f87171' },
      { name: 'Positive', value: stats.positive, color: '#4ade80' },
      { name: 'Pending', value: stats.pending, color: '#a78bfa' }
    ]
  }

  // Prepare data for line chart
  const getLineChartData = () => {
    const groupedByDate = {}
    
    userPredictions.forEach(pred => {
      const date = new Date(pred.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      groupedByDate[date] = (groupedByDate[date] || 0) + 1
    })
    
    return Object.entries(groupedByDate).map(([date, count]) => ({
      date,
      count
    })).slice(-10) // Last 10 data points
  }

  // Prepare data for bar chart (confidence distribution)
  const getConfidenceData = () => {
    const ranges = {
      '70-80%': 0,
      '80-90%': 0,
      '90-100%': 0
    }
    
    userPredictions.forEach(pred => {
      if (pred.confidence) {
        const conf = pred.confidence * 100
        if (conf >= 70 && conf < 80) ranges['70-80%']++
        else if (conf >= 80 && conf < 90) ranges['80-90%']++
        else if (conf >= 90) ranges['90-100%']++
      }
    })
    
    return [
      { range: '70-80%', count: ranges['70-80%'], percentage: '42%' },
      { range: '80-90%', count: ranges['80-90%'], percentage: '33%' },
      { range: '90-100%', count: ranges['90-100%'], percentage: '25%' }
    ]
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'sessions', label: 'Sessions', icon: '🔗' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'audit', label: 'Audit Logs', icon: '📄' },
    { id: 'admin', label: 'Admin', icon: '👤' }
  ]

  return (
    <div className="admin-dashboard">
      {/* Sidebar Menu */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <span className="admin-logo-icon">🏥</span>
            {!sidebarCollapsed && <span className="admin-logo-text">CKD Admin</span>}
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu(item.id)
                setSelectedUser(null)
                if (item.id === 'users') {
                  setShowUsers(true)
                  setBreadcrumb(['Dashboard', 'Users'])
                } else if (item.id === 'dashboard') {
                  setShowUsers(false)
                  setBreadcrumb(['Dashboard'])
                } else {
                  setShowUsers(false)
                  setBreadcrumb(['Dashboard', item.label])
                }
              }}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="admin-info">
                <span className="admin-name">{admin?.name || 'Admin'}</span>
                <span className="admin-role">Administrator</span>
              </div>
            )}
          </div>
          
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            {sidebarCollapsed ? '🚪' : '🚪 Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-container">
            <div className="breadcrumb-navigation">
              {breadcrumb.map((crumb, index) => (
                <span key={index} className="breadcrumb-item">
                  {index > 0 && <span className="breadcrumb-separator">/</span>}
                  <button 
                    className={`breadcrumb-link ${index === breadcrumb.length - 1 ? 'active' : ''}`}
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {crumb}
                  </button>
                </span>
              ))}
            </div>
            
            <div className="header-actions">
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
                    <path className="bulb-glass" d="M32 20c-11 0-20 9-20 20 0 8 4.2 14.1 11 18.2V60h18v-1.8c6.8-4.1 11-10.2 11-18.2 0-11-9-20-20-20z" />
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
              <div className="admin-badge">
                <span className="badge-icon">👤</span>
                <span className="badge-text">admin</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="admin-main">
          <div className="admin-container">
            {/* Stats Cards - Dashboard View */}
            {activeMenu === 'dashboard' && (
              <div className="stats-grid">
                <div className="stat-card clickable" onClick={() => {
                  setActiveMenu('users')
                  setShowUsers(true)
                }}>
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p className="stat-value">{loading ? '...' : stats.totalUsers}</p>
                  </div>
                  <div className="toggle-indicator">▶</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3>Total Predictions</h3>
                    <p className="stat-value">{loading ? '...' : stats.totalPredictions}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔗</div>
                  <div className="stat-info">
                    <h3>Active Sessions</h3>
                    <p className="stat-value">{loading ? '...' : stats.activeSessions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Section */}
            {activeMenu === 'users' && !selectedUser && (
            <div className="users-section">
              <h2 className="section-title">Registered Users</h2>
            
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={index}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className="status-badge active">Active</span>
                          </td>
                          <td>
                            <div className="user-actions">
                              <button 
                                className="view-details-btn"
                                onClick={() => handleViewDetails(user)}
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          )}

          {/* User Details View */}
          {activeMenu === 'user-details' && selectedUser && (
            <div className="user-details-view">
              {/* User Profile Header */}
              <div className="user-profile-header">
                <div className="user-profile-left">
                  <div className="user-avatar-large">
                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-profile-info">
                    <div className="user-name-header">
                      <h2>{selectedUser.name}</h2>
                      <span className="user-status-badge active">Active</span>
                    </div>
                    <div className="user-metadata">
                      <span className="metadata-item">
                        <span className="metadata-icon">📧</span>
                        {selectedUser.email}
                      </span>
                      <span className="metadata-item">
                        <span className="metadata-icon">🌐</span>
                        IP: 192.168.11
                      </span>
                    </div>
                    <div className="user-dates">
                      <span>Joined Date: {new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                      <span>Last Login: {new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="user-profile-actions">
                  <button className="btn-download" onClick={handleDownloadRecords}>
                    <span className="btn-icon">📥</span>
                    Download Records
                  </button>
                  <button className="btn-remove" onClick={handleRemoveUser}>
                    Remove User
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs-container">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('predictions')}
                >
                  Predictions Activity
                </button>
                <button
                  className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Login History
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  {loadingPredictions ? (
                    <div className="loading">Loading predictions...</div>
                  ) : (
                    <>
                      {/* Summary Cards and Charts Row */}
                      <div className="overview-grid">
                        {/* Left Column - Prediction Summary */}
                        <div className="overview-left-col">
                          <div className="prediction-summary-section">
                            <h3 className="section-subtitle">Prediction Summary</h3>
                            <div className="summary-cards">
                              <div className="summary-card negative">
                                <div className="summary-value">{getPredictionStats().negative}</div>
                                <div className="summary-label">Negative</div>
                              </div>
                              <div className="summary-card positive">
                                <div className="summary-value">{getPredictionStats().positive}</div>
                                <div className="summary-label">Positive</div>
                              </div>
                              <div className="summary-card pending">
                                <div className="summary-value">{getPredictionStats().pending}</div>
                                <div className="summary-label">Pending</div>
                              </div>
                            </div>
                          </div>

                          {/* CKD Risk Distribution */}
                          <div className="chart-section">
                            <h3 className="section-subtitle">CKD Risk Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={getPieChartData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {getPieChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-legend">
                              {getPieChartData().map((entry, index) => (
                                <div key={index} className="legend-item">
                                  <span className="legend-color" style={{ backgroundColor: entry.color }}></span>
                                  <span className="legend-name">{entry.name}</span>
                                  <span className="legend-percentage">
                                    {userPredictions.length > 0 ? Math.round((entry.value / userPredictions.length) * 100) : 0}%
                                  </span>
                                </div>
                              ))}
                            </div>
                            <button className="view-report-btn">View Report →</button>
                          </div>
                        </div>

                        {/* Right Column - Data Overview */}
                        <div className="overview-right-col">
                          <div className="chart-section">
                            <div className="chart-header">
                              <h3 className="section-subtitle">Prediction Data Overview</h3>
                              <button className="view-report-link">View Report →</button>
                            </div>
                            <div className="chart-label">Prediction Submissions</div>
                            <div className="chart-count">{userPredictions.length}</div>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={getLineChartData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Model Confidence */}
                          <div className="chart-section">
                            <h3 className="section-subtitle">Model Confidence</h3>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={getConfidenceData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="range" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Prediction Sessions Table */}
                      <div className="prediction-sessions-section">
                        <div className="sessions-header">
                          <h3 className="section-subtitle">Prediction Sessions</h3>
                          <div className="sessions-controls">
                            <input 
                              type="text" 
                              placeholder="Search records..." 
                              className="search-input"
                            />
                            <button className="filter-btn">Filter</button>
                          </div>
                        </div>
                        <div className="sessions-table-container">
                          <table className="sessions-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>DATE</th>
                                <th>RESULT</th>
                                <th>CONFIDENCE</th>
                                <th>FILE</th>
                                <th>FILE</th>
                                <th>ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userPredictions.slice(0, 8).map((prediction, index) => (
                                <tr key={index}>
                                  <td>{1200 + index}</td>
                                  <td>{new Date(prediction.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</td>
                                  <td>
                                    <span className={`result-badge ${
                                      prediction.result === 'CKD' || prediction.result === 'positive' || prediction.result === 'ckd' 
                                        ? 'negative' 
                                        : prediction.result === 'No CKD' || prediction.result === 'negative' || prediction.result === 'notckd'
                                        ? 'positive'
                                        : 'pending'
                                    }`}>
                                      {prediction.result === 'CKD' || prediction.result === 'positive' || prediction.result === 'ckd' 
                                        ? 'Negative' 
                                        : prediction.result === 'No CKD' || prediction.result === 'negative' || prediction.result === 'notckd'
                                        ? 'Positive'
                                        : 'Pending'}
                                    </span>
                                  </td>
                                  <td>{prediction.confidence ? `${(prediction.confidence * 100).toFixed(0)}%` : 'N/A'}</td>
                                  <td>ckd_data_{index}.csv</td>
                                  <td>ckd_data_april.csv</td>
                                  <td>
                                    <button className="action-btn view-btn">View Details</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="table-pagination">
                          <span className="pagination-info">Showing 1 to 8 entries</span>
                          <div className="pagination-controls">
                            <button className="pagination-btn">Previous</button>
                            <button className="pagination-btn active">1</button>
                            <button className="pagination-btn">Next</button>
                            <span className="pagination-show">Show 10</span>
                            <span className="pagination-total">8/mass1 →</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'predictions' && (
                <div className="tab-content">
                  {loadingPredictions ? (
                    <div className="loading">Loading predictions...</div>
                  ) : (
                    <div className="predictions-activity-section">
                      <div className="activity-header">
                        <h3 className="section-subtitle">All Predictions</h3>
                        <div className="activity-controls">
                          <select className="filter-select">
                            <option value="all">All Types</option>
                            <option value="single">Single</option>
                            <option value="batch">Batch</option>
                          </select>
                          <select className="filter-select">
                            <option value="all">All Results</option>
                            <option value="ckd">CKD</option>
                            <option value="no-ckd">No CKD</option>
                          </select>
                        </div>
                      </div>
                      
                      {userPredictions.length > 0 ? (
                        <div className="predictions-list">
                          {userPredictions.map((prediction, index) => (
                            <div key={index} className="prediction-card">
                              <div className="prediction-card-header">
                                <div className="prediction-id">
                                  <span className="id-label">ID:</span>
                                  <span className="id-value">#{1000 + index}</span>
                                </div>
                                <div className="prediction-date">
                                  {new Date(prediction.created_at).toLocaleString()}
                                </div>
                              </div>
                              
                              <div className="prediction-card-body">
                                <div className="prediction-info-row">
                                  <div className="info-item">
                                    <span className="info-label">Type:</span>
                                    <span className={`type-badge ${prediction.type || 'single'}`}>
                                      {prediction.type === 'batch' ? 'Batch' : 'Single'}
                                    </span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">Result:</span>
                                    <span className={`result-badge ${
                                      prediction.result === 'CKD' ? 'positive' : 'negative'
                                    }`}>
                                      {prediction.result}
                                    </span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">Confidence:</span>
                                    <span className="confidence-value">
                                      {prediction.confidence ? `${parseFloat(prediction.confidence).toFixed(1)}%` : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="prediction-details">
                                  <div className="detail-grid">
                                    {prediction.age && (
                                      <div className="detail-item">
                                        <span className="detail-label">Age:</span>
                                        <span className="detail-value">{prediction.age}</span>
                                      </div>
                                    )}
                                    {prediction.bp && (
                                      <div className="detail-item">
                                        <span className="detail-label">BP:</span>
                                        <span className="detail-value">{prediction.bp}</span>
                                      </div>
                                    )}
                                    {prediction.sg && (
                                      <div className="detail-item">
                                        <span className="detail-label">SG:</span>
                                        <span className="detail-value">{prediction.sg}</span>
                                      </div>
                                    )}
                                    {prediction.al && (
                                      <div className="detail-item">
                                        <span className="detail-label">AL:</span>
                                        <span className="detail-value">{prediction.al}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <div className="empty-state-icon">🔮</div>
                          <h3>No Predictions Yet</h3>
                          <p>This user hasn't made any predictions yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'login' && (
                <div className="tab-content">
                  <div className="login-history-section">
                    <div className="activity-header">
                      <h3 className="section-subtitle">Login Sessions</h3>
                      <div className="activity-controls">
                        <select className="filter-select">
                          <option value="all">All Sessions</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="login-history-table">
                      <table className="sessions-table">
                        <thead>
                          <tr>
                            <th>DATE & TIME</th>
                            <th>IP ADDRESS</th>
                            <th>DEVICE</th>
                            <th>LOCATION</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'N/A'}</td>
                            <td>{selectedUser?.ip || '192.168.1.1'}</td>
                            <td>
                              <div className="device-info">
                                <span className="device-icon">💻</span>
                                <span>Desktop - Windows</span>
                              </div>
                            </td>
                            <td>
                              <div className="location-info">
                                <span className="location-icon">📍</span>
                                <span>Tamil Nadu, India</span>
                              </div>
                            </td>
                            <td>
                              <span className="status-badge active">Current Session</span>
                            </td>
                          </tr>
                          <tr>
                            <td>{selectedUser?.joinedDate ? new Date(selectedUser.joinedDate).toLocaleString() : 'N/A'}</td>
                            <td>{selectedUser?.ip || '192.168.1.1'}</td>
                            <td>
                              <div className="device-info">
                                <span className="device-icon">📱</span>
                                <span>Mobile - Android</span>
                              </div>
                            </td>
                            <td>
                              <div className="location-info">
                                <span className="location-icon">📍</span>
                                <span>Tamil Nadu, India</span>
                              </div>
                            </td>
                            <td>
                              <span className="status-badge expired">Expired</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="login-stats">
                      <div className="stat-card">
                        <div className="stat-icon">🔐</div>
                        <div className="stat-content">
                          <div className="stat-value">2</div>
                          <div className="stat-label">Total Logins</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                          <div className="stat-value">
                            {selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="stat-label">Last Login</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                          <div className="stat-value">
                            {selectedUser?.joinedDate ? new Date(selectedUser.joinedDate).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="stat-label">First Login</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Predictions Section */}
          {activeMenu === 'predictions' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">🔮</div>
                <h3>Predictions Management</h3>
                <p>View and manage all prediction records here.</p>
              </div>
            </div>
          )}

          {/* Other sections remain the same */}
          {activeMenu === 'sessions' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">🔗</div>
                <h3>Sessions Management</h3>
                <p>View and manage user sessions here.</p>
              </div>
            </div>
          )}

          {activeMenu === 'reports' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>Reports</h3>
                <p>Generate and view reports here.</p>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeMenu === 'analytics' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">📈</div>
                <h3>Analytics Dashboard</h3>
                <p>Detailed analytics and insights coming soon.</p>
              </div>
            </div>
          )}

          {/* Doctors Section */}
          {activeMenu === 'doctors' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">👨‍⚕️</div>
                <h3>Doctors Management</h3>
                <p>Manage doctors and medical professionals here.</p>
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {activeMenu === 'alerts' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <h3>Alerts & Notifications</h3>
                <p>Manage system alerts and notifications here.</p>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeMenu === 'settings' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">⚙️</div>
                <h3>System Settings</h3>
                <p>Configure system settings and preferences here.</p>
              </div>
            </div>
          )}

          {/* Audit Logs Section */}
          {activeMenu === 'audit' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>Audit Logs</h3>
                <p>View system audit logs and activity history here.</p>
              </div>
            </div>
          )}

          {/* Admin Section */}
          {activeMenu === 'admin' && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <h3>Admin Management</h3>
                <p>Manage admin users and permissions here.</p>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button className="close-modal-btn" onClick={closeModal}>×</button>
            </div>

            <div className="user-details-info">
              <div className="user-detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="user-detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="user-detail-item">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">
                  {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="user-detail-item">
                <span className="detail-label">Total Predictions:</span>
                <span className="detail-value">{userPredictions.length}</span>
              </div>
            </div>

            <div className="predictions-section">
              <h3 className="predictions-title">CKD Prediction History</h3>
              
              {loadingPredictions ? (
                <div className="loading-spinner">Loading predictions...</div>
              ) : userPredictions.length > 0 ? (
                <div className="predictions-list">
                  {userPredictions.map((prediction, index) => (
                    <div key={index} className="prediction-card">
                      <div className="prediction-header">
                        <span className="prediction-date">
                          {new Date(prediction.date || prediction.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`prediction-result ${prediction.result === 'CKD' || prediction.result === 'positive' ? 'positive' : 'negative'}`}>
                          {prediction.result === 'CKD' || prediction.result === 'positive' ? 'CKD Detected' : 'No CKD'}
                        </span>
                      </div>
                      
                      <div className="prediction-details">
                        {prediction.age && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Age</span>
                            <span className="prediction-detail-value">{prediction.age}</span>
                          </div>
                        )}
                        {prediction.bp && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Blood Pressure</span>
                            <span className="prediction-detail-value">{prediction.bp}</span>
                          </div>
                        )}
                        {prediction.sg && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Specific Gravity</span>
                            <span className="prediction-detail-value">{prediction.sg}</span>
                          </div>
                        )}
                        {prediction.al && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Albumin</span>
                            <span className="prediction-detail-value">{prediction.al}</span>
                          </div>
                        )}
                        {prediction.su && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Sugar</span>
                            <span className="prediction-detail-value">{prediction.su}</span>
                          </div>
                        )}
                        {prediction.bgr && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Blood Glucose</span>
                            <span className="prediction-detail-value">{prediction.bgr}</span>
                          </div>
                        )}
                        {prediction.bu && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Blood Urea</span>
                            <span className="prediction-detail-value">{prediction.bu}</span>
                          </div>
                        )}
                        {prediction.sc && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Serum Creatinine</span>
                            <span className="prediction-detail-value">{prediction.sc}</span>
                          </div>
                        )}
                        {prediction.confidence && (
                          <div className="prediction-detail">
                            <span className="prediction-detail-label">Confidence</span>
                            <span className="prediction-detail-value">{(prediction.confidence * 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-predictions">
                  <div className="no-predictions-icon">🔮</div>
                  <p className="no-predictions-text">No predictions found for this user</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

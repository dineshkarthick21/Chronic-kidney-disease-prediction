import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
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

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-logo">
            <span className="admin-logo-icon">🏥</span>
            <span className="admin-logo-text">Admin Dashboard</span>
          </div>

          <div className="admin-nav">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            
            <div className="admin-profile">
              <div className="admin-avatar">
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="admin-name">{admin?.name || 'Admin'}</span>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="admin-main">
        <div className="admin-container">
          <h1 className="dashboard-title">Dashboard Overview</h1>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{loading ? '...' : stats.totalUsers}</p>
              </div>
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

          {/* Users Table */}
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard

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
  const [showUsers, setShowUsers] = useState(false)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
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
                if (item.id === 'users') setShowUsers(true)
                else setShowUsers(false)
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
            <h1 className="page-title">
              {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'}
            </h1>
            
            <div className="header-actions">
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
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
            {activeMenu === 'users' && (
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

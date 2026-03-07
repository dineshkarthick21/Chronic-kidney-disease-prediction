import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Reports.css'

function Reports({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No token found in localStorage')
        setLoading(false)
        return
      }
      
      console.log('Fetching predictions with token:', token.substring(0, 20) + '...')
      
      const response = await fetch('http://localhost:5000/api/predictions/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Predictions received:', data)
        setPredictions(data.predictions || [])
      } else {
        const errorData = await response.json()
        console.error('Error fetching predictions:', errorData)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPredictionStats = () => {
    const negative = predictions.filter(p => p.result === 'No CKD' || p.result === 'Not CKD' || p.result === 'Negative').length
    const positive = predictions.filter(p => p.result === 'CKD' || p.result === 'Positive').length
    const pending = predictions.filter(p => p.result === 'Pending' || p.result === 'Error').length

    return { negative, positive, pending, total: predictions.length }
  }

  const getPieChartData = () => {
    const stats = getPredictionStats()
    return [
      { name: 'Negative', value: stats.negative, color: '#ef4444' },
      { name: 'Positive', value: stats.positive, color: '#10b981' },
      { name: 'Pending', value: stats.pending, color: '#8b5cf6' }
    ].filter(item => item.value > 0)
  }

  const getLineChartData = () => {
    const monthlyData = {}
    
    predictions.forEach(pred => {
      const date = new Date(pred.created_at)
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey]++
    })

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      predictions: count
    }))
  }

  const getConfidenceData = () => {
    const ranges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    }

    predictions.forEach(pred => {
      const confidence = parseFloat(pred.confidence) || 0
      if (confidence <= 20) ranges['0-20%']++
      else if (confidence <= 40) ranges['21-40%']++
      else if (confidence <= 60) ranges['41-60%']++
      else if (confidence <= 80) ranges['61-80%']++
      else ranges['81-100%']++
    })

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count
    }))
  }

  const stats = getPredictionStats()

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h1 className="reports-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 2v4m6-4v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" strokeWidth="2"/>
          </svg>
          Reports
        </h1>
      </div>

      {/* User Profile Card */}
      <div className="reports-profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-details">
            <h2 className="profile-name">{user?.name || 'User'}</h2>
            <span className="profile-status">ACTIVE</span>
          </div>
        </div>
        <div className="profile-meta">
          <div className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="4" strokeWidth="2"/>
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" strokeWidth="2"/>
            </svg>
            <span>{user?.email}</span>
          </div>
          <div className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2"/>
            </svg>
            <span>IP: {user?.ip || 'N/A'}</span>
          </div>
        </div>
        <div className="profile-dates">
          <span>Joined Date: {user?.joinedDate || new Date().toLocaleDateString()}</span>
          <span>Last Login: {user?.lastLogin || new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Prediction Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Predictions Activity
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Login History
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading predictions...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="overview-content">
              {/* Prediction Summary Cards */}
              <div className="summary-section">
                <h3 className="section-title">Prediction Summary</h3>
                <div className="summary-cards">
                  <div className="summary-card negative">
                    <div className="card-value">{stats.negative}</div>
                    <div className="card-label">NEGATIVE</div>
                  </div>
                  <div className="summary-card positive">
                    <div className="card-value">{stats.positive}</div>
                    <div className="card-label">POSITIVE</div>
                  </div>
                  <div className="summary-card pending">
                    <div className="card-value">{stats.pending}</div>
                    <div className="card-label">PENDING</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                {/* CKD Risk Distribution */}
                <div className="chart-card">
                  <h3 className="chart-title">CKD Risk Distribution</h3>
                  <div className="chart-container">
                    {getPieChartData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getPieChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getPieChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No prediction data available</div>
                    )}
                  </div>
                </div>

                {/* Prediction Data Overview */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Prediction Data Overview</h3>
                    <button className="view-report-btn">View Report →</button>
                  </div>
                  <div className="prediction-count">
                    <span className="count-label">PREDICTION SUBMISSIONS</span>
                    <span className="count-value">{stats.total}</span>
                  </div>
                  <div className="chart-container">
                    {getLineChartData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={getLineChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="predictions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No trend data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Model Confidence Distribution */}
              <div className="chart-card full-width">
                <h3 className="chart-title">Model Confidence Distribution</h3>
                <div className="chart-container">
                  {getConfidenceData().some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getConfidenceData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="no-data">No confidence data available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="sessions-content">
              {/* Prediction Sessions Table */}
              <div className="prediction-sessions-section">
                <div className="sessions-header">
                  <h3 className="section-title">Prediction Sessions</h3>
                  <div className="sessions-controls">
                    <input 
                      type="text" 
                      placeholder="Search records..." 
                      className="search-input"
                    />
                    <button className="filter-btn">Filter</button>
                  </div>
                </div>
                
                {predictions.length > 0 ? (
                  <>
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
                          {predictions.slice(0, 8).map((prediction, index) => (
                            <tr key={index}>
                              <td>{1200 + index}</td>
                              <td>{new Date(prediction.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</td>
                              <td>
                                <span className={`result-badge ${
                                  prediction.result === 'CKD' || prediction.result === 'Positive' 
                                    ? 'positive' 
                                    : prediction.result === 'No CKD' || prediction.result === 'Negative' || prediction.result === 'Not CKD'
                                    ? 'negative'
                                    : 'pending'
                                }`}>
                                  {prediction.result === 'CKD' ? 'POSITIVE' 
                                    : prediction.result === 'No CKD' || prediction.result === 'Not CKD' ? 'NEGATIVE'
                                    : prediction.result?.toUpperCase() || 'PENDING'}
                                </span>
                              </td>
                              <td>{prediction.confidence ? `${parseFloat(prediction.confidence).toFixed(0)}%` : 'N/A'}</td>
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
                      <span className="pagination-info">Showing 1 to {Math.min(8, predictions.length)} of {predictions.length} entries</span>
                      <div className="pagination-controls">
                        <button className="pagination-btn">Previous</button>
                        <button className="pagination-btn active">1</button>
                        <button className="pagination-btn">Next</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data-message">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 2v4m6-4v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" strokeWidth="2"/>
                    </svg>
                    <h3>No Prediction Sessions Yet</h3>
                    <p>Start making predictions to see your sessions here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-content">
              <h3 className="section-title">Prediction History</h3>
              {predictions.length > 0 ? (
                <div className="predictions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Result</th>
                        <th>Confidence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred, index) => (
                        <tr key={index}>
                          <td>{new Date(pred.created_at).toLocaleString()}</td>
                          <td>
                            <span className={`type-badge ${pred.type}`}>
                              {pred.type === 'batch' ? 'Batch' : 'Single'}
                            </span>
                          </td>
                          <td>
                            <span className={`result-badge ${pred.result?.toLowerCase().includes('ckd') && !pred.result?.toLowerCase().includes('no') ? 'positive' : 'negative'}`}>
                              {pred.result}
                            </span>
                          </td>
                          <td>{parseFloat(pred.confidence).toFixed(1)}%</td>
                          <td>
                            <span className="status-badge completed">Completed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data-message">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 2v4m6-4v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" strokeWidth="2"/>
                  </svg>
                  <h3>No Predictions Yet</h3>
                  <p>Start making predictions to see your activity here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-content">
              <h3 className="section-title">Login History</h3>
              <div className="login-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>IP Address</th>
                      <th>Device</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{new Date().toLocaleString()}</td>
                      <td>{user?.ip || '192.168.1.1'}</td>
                      <td>Desktop - Windows</td>
                      <td><span className="status-badge success">Current Session</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports

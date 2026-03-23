import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import './Reports.css'

function Reports({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionsQuery, setSessionsQuery] = useState('')
  const [sessionsTypeFilter, setSessionsTypeFilter] = useState('all')
  const [sessionsSort, setSessionsSort] = useState('newest')

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
      { name: 'Pending', value: stats.pending, color: '#f59e0b' }
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

  const downloadPredictionPDF = (prediction) => {
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(41, 128, 185)
      doc.text('CKD Patient Prediction Report', 105, 20, { align: 'center' })
      
      // Date and patient info
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Patient: ${prediction.patient_name || 'Anonymous'}`, 14, 35)
      doc.text(`Generated: ${new Date(prediction.created_at).toLocaleString()}`, 14, 41)
      
      // Prediction result box
      const boxY = 55
      const result = prediction.result === 'CKD' || prediction.result === 'Positive' ? 'CKD' : 'No CKD'
      const confidence = parseFloat(prediction.confidence)
      
      if (result === 'CKD') {
        doc.setFillColor(231, 76, 60) // Red for CKD
      } else {
        doc.setFillColor(46, 204, 113) // Green for No CKD
      }
      
      doc.rect(60, boxY, 90, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text(result, 105, boxY + 15, { align: 'center' })
      doc.setFontSize(14)
      doc.text(`Confidence: ${confidence.toFixed(1)}%`, 105, boxY + 28, { align: 'center' })
      
      // Patient Parameters Table
      autoTable(doc, {
        startY: 105,
        head: [['Parameter', 'Value', 'Parameter', 'Value']],
        body: [
          ['Age', `${prediction.age || 'N/A'} years`, 'Blood Pressure', `${prediction.bp || 'N/A'} mm/Hg`],
          ['Specific Gravity', prediction.sg || 'N/A', 'Albumin', prediction.al || 'N/A'],
          ['Sugar', prediction.su || 'N/A', 'RBC', prediction.rbc || 'N/A'],
          ['Pus Cell', prediction.pc || 'N/A', 'Pus Cell Clumps', prediction.pcc || 'N/A'],
          ['Bacteria', prediction.ba || 'N/A', 'Blood Glucose', `${prediction.bgr || 'N/A'} mgs/dl`],
          ['Blood Urea', `${prediction.bu || 'N/A'} mgs/dl`, 'Serum Creatinine', `${prediction.sc || 'N/A'} mgs/dl`],
          ['Sodium', `${prediction.sod || 'N/A'} mEq/L`, 'Potassium', `${prediction.pot || 'N/A'} mEq/L`],
          ['Hemoglobin', `${prediction.hemo || 'N/A'} gms`, 'PCV', prediction.pcv || 'N/A'],
          ['WBC Count', `${prediction.wc || 'N/A'} cells/cumm`, 'RBC Count', `${prediction.rc || 'N/A'} millions/cmm`],
          ['Hypertension', prediction.htn || 'N/A', 'Diabetes', prediction.dm || 'N/A'],
          ['CAD', prediction.cad || 'N/A', 'Appetite', prediction.appet || 'N/A'],
          ['Pedal Edema', prediction.pe || 'N/A', 'Anemia', prediction.ane || 'N/A'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
          2: { fontStyle: 'bold', fillColor: [240, 240, 240] }
        }
      })
      
      let yPos = doc.lastAutoTable.finalY + 15
      
      // Interpretation Section
      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('Interpretation & Recommendations', 14, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      
      if (result === 'CKD') {
        const recommendations = [
          '⚠️ Chronic Kidney Disease Detected',
          '',
          'Immediate Actions Required:',
          '• Schedule an appointment with a nephrologist',
          '• Get comprehensive kidney function tests (eGFR, Creatinine)',
          '• Discuss treatment options and lifestyle modifications',
          '',
          'Dietary Modifications:',
          '• Reduce sodium intake (less than 2,300mg per day)',
          '• Limit protein intake as advised by your doctor',
          '• Control potassium and phosphorus levels',
          '• Stay well-hydrated (unless otherwise advised)',
          '',
          'Lifestyle Changes:',
          '• Maintain healthy blood pressure (below 130/80 mmHg)',
          '• Control blood sugar if diabetic (HbA1c < 7%)',
          '• Regular exercise (30 minutes, 5 days/week)',
          '• Quit smoking and limit alcohol consumption',
        ]
        
        recommendations.forEach(line => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos, { maxWidth: 180 })
          yPos += 5
        })
      } else {
        const recommendations = [
          '✅ No Chronic Kidney Disease Detected',
          '',
          'Preventive Measures:',
          '• Maintain regular health check-ups',
          '• Continue healthy lifestyle practices',
          '• Monitor blood pressure and blood sugar levels',
          '• Stay well-hydrated (8-10 glasses daily)',
          '• Eat a balanced diet with fruits and vegetables',
          '• Regular exercise (150 minutes/week)',
          '• Limit processed foods and reduce salt intake',
          '• Avoid smoking and excessive alcohol',
          '• Manage stress through meditation or yoga',
          '• Get adequate sleep (7-9 hours)',
        ]
        
        recommendations.forEach(line => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos, { maxWidth: 180 })
          yPos += 5
        })
      }
      
      // Medical Disclaimer
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(231, 76, 60)
      doc.text('⚕️ Medical Disclaimer', 14, yPos)
      yPos += 8
      
      doc.setFontSize(9)
      doc.setTextColor(100)
      const disclaimer = 'This prediction is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.'
      doc.text(disclaimer, 14, yPos, { maxWidth: 180, align: 'justify' })
      
      // Save PDF
      const patientName = prediction.patient_name || 'patient'
      const fileName = `CKD_Report_${patientName.replace(/\s+/g, '_')}_${new Date(prediction.created_at).toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const stats = getPredictionStats()
  const filteredSessions = [...predictions]
    .filter((prediction) => {
      const patientName = (prediction.patient_name || 'Anonymous').toLowerCase()
      const result = (prediction.result || '').toLowerCase()
      const query = sessionsQuery.toLowerCase()
      const matchesQuery =
        patientName.includes(query) ||
        result.includes(query) ||
        new Date(prediction.created_at).toLocaleDateString().includes(query)

      const normalizedType = (prediction.type || 'single').toLowerCase()
      const matchesType = sessionsTypeFilter === 'all' || normalizedType === sessionsTypeFilter

      return matchesQuery && matchesType
    })
    .sort((a, b) => {
      if (sessionsSort === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at)
      }

      if (sessionsSort === 'confidence') {
        return (parseFloat(b.confidence) || 0) - (parseFloat(a.confidence) || 0)
      }

      return new Date(b.created_at) - new Date(a.created_at)
    })

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
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
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
                            fill="#2563eb"
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
                          <Line type="monotone" dataKey="predictions" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
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
                      value={sessionsQuery}
                      onChange={(e) => setSessionsQuery(e.target.value)}
                    />
                    <select
                      className="session-select"
                      value={sessionsTypeFilter}
                      onChange={(e) => setSessionsTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="single">Single</option>
                      <option value="batch">Batch</option>
                    </select>
                    <select
                      className="session-select"
                      value={sessionsSort}
                      onChange={(e) => setSessionsSort(e.target.value)}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="confidence">Highest Confidence</option>
                    </select>
                    <button
                      className="filter-btn"
                      onClick={() => {
                        setSessionsQuery('')
                        setSessionsTypeFilter('all')
                        setSessionsSort('newest')
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                {filteredSessions.length > 0 ? (
                  <>
                    <div className="sessions-table-container">
                      <table className="sessions-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>PATIENT NAME</th>
                            <th>DATE</th>
                            <th>TYPE</th>
                            <th>RESULT</th>
                            <th>CONFIDENCE</th>
                            <th>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSessions.slice(0, 8).map((prediction, index) => (
                            <tr key={index}>
                              <td>{1200 + index}</td>
                              <td>{prediction.patient_name || 'Anonymous'}</td>
                              <td>{new Date(prediction.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</td>
                              <td>
                                <span className={`type-badge ${prediction.type}`}>
                                  {prediction.type === 'batch' ? 'Batch' : 'Single'}
                                </span>
                              </td>
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
                              <td>
                                <button 
                                  className="action-btn download-btn"
                                  onClick={() => downloadPredictionPDF(prediction)}
                                  title="Download PDF Report"
                                >
                                  📥 PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-pagination">
                      <span className="pagination-info">Showing 1 to {Math.min(8, filteredSessions.length)} of {filteredSessions.length} entries</span>
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
                    <h3>{predictions.length > 0 ? 'No Matching Records' : 'No Prediction Sessions Yet'}</h3>
                    <p>{predictions.length > 0 ? 'Try changing search or filters' : 'Start making predictions to see your sessions here'}</p>
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
                        <th>Patient Name</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Result</th>
                        <th>Confidence</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred, index) => (
                        <tr key={index}>
                          <td>{pred.patient_name || 'Anonymous'}</td>
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
                          <td>
                            <button 
                              className="action-btn download-btn"
                              onClick={() => downloadPredictionPDF(pred)}
                              title="Download PDF Report"
                            >
                              📥 Download
                            </button>
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

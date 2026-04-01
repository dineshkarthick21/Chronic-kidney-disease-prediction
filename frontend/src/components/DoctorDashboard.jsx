import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import './DoctorDashboard.css'

const API_BASE = 'http://localhost:5000'

function DoctorDashboard({ doctor, onLogout }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPredictions: 0,
    highRiskCases: 0
  })
  const [patients, setPatients] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientMessages, setPatientMessages] = useState(new Map())
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isSocketReady, setIsSocketReady] = useState(false)
  const [patientPredictions, setPatientPredictions] = useState([])

  const socketRef = useRef(null)
  const token = localStorage.getItem('doctorToken')

  useEffect(() => {
    fetchInitialData()
    connectSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (!selectedPatient) {
      setMessages([])
      return
    }

    fetchPatientPredictions(selectedPatient.id)
    // Load messages for the selected patient
    const patientMsgs = patientMessages.get(selectedPatient.id) || []
    setMessages(patientMsgs)
  }, [selectedPatient, patientMessages])

  const fetchInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [statsRes, patientsRes, conversationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/doctor/stats`, { headers }),
        fetch(`${API_BASE}/api/doctor/patients`, { headers }),
        fetch(`${API_BASE}/api/chat/doctor/conversations`, { headers })
      ])

      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        setPatients(patientsData.patients || [])
      }

      if (conversationsRes.ok) {
        const chatData = await conversationsRes.json()
        setConversations(chatData.conversations || [])
      }
    } catch (error) {
      console.error('Doctor dashboard data load failed', error)
    } finally {
      setLoading(false)
    }
  }

  const connectSocket = () => {
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000
    })

    socket.on('connect', () => {
      socket.emit('authenticate_socket', {
        role: 'doctor',
        token
      })
    })

    socket.on('socket_authenticated', () => {
      setIsSocketReady(true)
    })

    socket.on('chat_message', (message) => {
      const currentDoctorId = doctor?.id ? String(doctor.id) : ''
      if (currentDoctorId && String(message.doctor_id || '') !== currentDoctorId) {
        return
      }

      // Store message for the patient
      setPatientMessages((prev) => {
        const patientId = message.user_id
        const currentMessages = prev.get(patientId) || []
        
        // Check if message already exists to prevent duplicates
        const messageExists = currentMessages.some((msg) => msg.id === message.id)
        if (messageExists) {
          return prev
        }
        
        const updatedMessages = [...currentMessages, message]
        const newMap = new Map(prev)
        newMap.set(patientId, updatedMessages)
        return newMap
      })

      // Update conversations list
      setConversations((prev) => {
        const existing = prev.find((item) => item.userId === message.user_id)
        if (!existing) {
          return prev
        }

        const updated = {
          ...existing,
          lastMessage: message.text,
          lastSenderType: message.sender_type,
          lastMessageAt: message.created_at
        }

        return [updated, ...prev.filter((item) => item.userId !== message.user_id)]
      })
    })

    socket.on('socket_error', (error) => {
      console.error('Doctor socket error:', error)
    })

    socketRef.current = socket
  }

  const fetchPatientPredictions = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/doctor/patient-predictions/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPatientPredictions(data.predictions || [])
      } else {
        setPatientPredictions([])
      }
    } catch (error) {
      console.error('Prediction fetch failed', error)
      setPatientPredictions([])
    }
  }

  const downloadPredictionPDF = (prediction) => {
    try {
      const doc = new jsPDF()

      doc.setFontSize(20)
      doc.setTextColor(41, 128, 185)
      doc.text('CKD Patient Prediction Report', 105, 20, { align: 'center' })

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Patient: ${prediction.patient_name || 'Anonymous'}`, 14, 35)
      doc.text(`Generated: ${new Date(prediction.created_at).toLocaleString()}`, 14, 41)

      const boxY = 55
      const normalizedResult = prediction.result === 'CKD' || prediction.result === 'Positive' ? 'CKD' : 'No CKD'
      const confidence = Number.parseFloat(prediction.confidence)

      if (normalizedResult === 'CKD') {
        doc.setFillColor(231, 76, 60)
      } else {
        doc.setFillColor(46, 204, 113)
      }

      doc.rect(60, boxY, 90, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text(normalizedResult, 105, boxY + 15, { align: 'center' })
      doc.setFontSize(14)
      doc.text(`Confidence: ${Number.isFinite(confidence) ? confidence.toFixed(1) : 'N/A'}%`, 105, boxY + 28, { align: 'center' })

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
          ['Pedal Edema', prediction.pe || 'N/A', 'Anemia', prediction.ane || 'N/A']
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

      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('Interpretation & Recommendations', 14, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setTextColor(0)

      if (normalizedResult === 'CKD') {
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
          '• Quit smoking and limit alcohol consumption'
        ]

        recommendations.forEach((line) => {
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
          '• Get adequate sleep (7-9 hours)'
        ]

        recommendations.forEach((line) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos, { maxWidth: 180 })
          yPos += 5
        })
      }

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
      const disclaimer =
        'This prediction is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.'
      doc.text(disclaimer, 14, yPos, { maxWidth: 180, align: 'justify' })

      const patientName = prediction.patient_name || 'patient'
      const createdAt = prediction.created_at ? new Date(prediction.created_at) : new Date()
      const fileName = `CKD_Report_${patientName.replace(/\s+/g, '_')}_${createdAt.toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const sendMessage = () => {
    const text = messageText.trim()

    if (!text || !selectedPatient || !isSocketReady || !socketRef.current) {
      return
    }

    setSending(true)

    socketRef.current.emit('send_chat_message', {
      role: 'doctor',
      token,
      targetUserId: selectedPatient.id,
      text
    })

    setMessageText('')
    setSending(false)
  }

  const selectedConversation = useMemo(() => {
    if (!selectedPatient) {
      return null
    }
    return conversations.find((item) => item.userId === selectedPatient.id)
  }, [conversations, selectedPatient])

  if (loading) {
    return <div className="doctor-dashboard-loading">Loading doctor dashboard...</div>
  }

  return (
    <div className="doctor-dashboard">
      <header className="doctor-topbar">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>{doctor.name} • {doctor.specialization}</p>
        </div>
        <button className="doctor-logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <section className="doctor-stats-grid">
        <div className="doctor-stat-card">
          <h3>Total Patients</h3>
          <strong>{stats.totalPatients}</strong>
        </div>
        <div className="doctor-stat-card">
          <h3>Total Predictions</h3>
          <strong>{stats.totalPredictions}</strong>
        </div>
        <div className="doctor-stat-card">
          <h3>High Risk Cases</h3>
          <strong>{stats.highRiskCases}</strong>
        </div>
      </section>

      <section className="doctor-main-grid">
        <aside className="doctor-patient-panel">
          <h2>Patient List</h2>
          <div className="doctor-patient-list">
            {patients.map((patient) => (
              <button
                key={patient.id}
                className={`doctor-patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div>
                  <strong>{patient.name}</strong>
                  <p>{patient.email}</p>
                </div>
                <span>{patient.predictionCount} results</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="doctor-content-panel">
          {!selectedPatient ? (
            <div className="doctor-empty-state">Select a patient to view results and chat.</div>
          ) : (
            <>
              <div className="doctor-patient-header">
                <h2>{selectedPatient.name}</h2>
                <p>{selectedPatient.email}</p>
                {selectedConversation && (
                  <small>Last message: {selectedConversation.lastMessage}</small>
                )}
              </div>

              <div className="doctor-detail-grid">
                <div className="doctor-predictions-panel">
                  <h3>Prediction Results</h3>
                  <div className="doctor-prediction-list">
                    {patientPredictions.length === 0 ? (
                      <div className="doctor-sub-empty">No prediction history available.</div>
                    ) : (
                      patientPredictions.map((prediction) => (
                        <div key={prediction._id} className="doctor-prediction-card">
                          <div>
                            <strong>{prediction.result || 'Unknown'}</strong>
                            <p>{new Date(prediction.created_at).toLocaleString()}</p>
                          </div>
                          <div className="doctor-prediction-actions">
                            <span>{prediction.confidence ? `${Number(prediction.confidence).toFixed(2)}%` : 'N/A'}</span>
                            <button
                              type="button"
                              className="doctor-pdf-btn"
                              onClick={() =>
                                downloadPredictionPDF({
                                  ...prediction,
                                  patient_name: selectedPatient?.name || prediction.patient_name
                                })
                              }
                              title="Download PDF Report"
                            >
                              PDF
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="doctor-chat-panel">
                  <h3>Live Chat</h3>
                  <div className="doctor-chat-messages">
                    {messages.length === 0 ? (
                      <div className="doctor-sub-empty">No messages yet. Start the conversation.</div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`doctor-chat-bubble ${message.sender_type === 'doctor' ? 'doctor' : 'user'}`}
                        >
                          <p>{message.text}</p>
                          <small>{message.sender_name || message.sender_type}</small>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="doctor-chat-input-row">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={isSocketReady ? 'Type your message to patient...' : 'Connecting socket...'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage()
                        }
                      }}
                    />
                    <button onClick={sendMessage} disabled={!isSocketReady || sending}>Send</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default DoctorDashboard

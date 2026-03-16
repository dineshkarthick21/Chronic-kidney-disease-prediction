import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
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
                          <span>{prediction.confidence ? `${Number(prediction.confidence).toFixed(2)}%` : 'N/A'}</span>
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

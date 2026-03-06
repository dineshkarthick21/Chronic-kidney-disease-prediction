import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import './DoctorConsultation.css'

function DoctorConsultation({ user, onBack }) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('schedule') // 'schedule', 'upcoming', 'history'
  const [doctors, setDoctors] = useState([])
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    reason: '',
    notes: ''
  })
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchDoctors()
    fetchConsultations()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors || [])
      } else {
        // Mock data for demonstration
        setDoctors([
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            specialization: 'Nephrologist',
            experience: '15 years',
            rating: 4.8,
            availability: 'Mon-Fri: 9 AM - 5 PM',
            avatar: '👩‍⚕️',
            languages: ['English', 'Spanish']
          },
          {
            id: 2,
            name: 'Dr. Michael Chen',
            specialization: 'Kidney Specialist',
            experience: '12 years',
            rating: 4.9,
            availability: 'Mon-Sat: 10 AM - 6 PM',
            avatar: '👨‍⚕️',
            languages: ['English', 'Mandarin']
          },
          {
            id: 3,
            name: 'Dr. Emily Rodriguez',
            specialization: 'Renal Medicine Expert',
            experience: '10 years',
            rating: 4.7,
            availability: 'Tue-Sat: 8 AM - 4 PM',
            avatar: '👩‍⚕️',
            languages: ['English', 'Spanish', 'French']
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      // Use mock data on error
      setDoctors([
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          specialization: 'Nephrologist',
          experience: '15 years',
          rating: 4.8,
          availability: 'Mon-Fri: 9 AM - 5 PM',
          avatar: '👩‍⚕️',
          languages: ['English', 'Spanish']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/consultations/${user.email}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched consultations from backend:', data.consultations)
        
        // Ensure all consultations have required fields
        const processedConsultations = (data.consultations || []).map(consultation => ({
          ...consultation,
          // Ensure meetingLink exists
          meetingLink: consultation.meetingLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`,
          // Ensure id exists
          id: consultation.id || consultation._id,
          // Ensure date is properly formatted
          date: consultation.date || new Date().toISOString()
        }))
        
        setConsultations(processedConsultations)
        console.log('Processed consultations:', processedConsultations)
      } else {
        console.log('Failed to fetch from backend, using mock data')
        // Mock data for demonstration
        const mockConsultations = [
          {
            id: 1,
            doctor: {
              name: 'Dr. Sarah Johnson',
              specialization: 'Nephrologist',
              avatar: '👩‍⚕️'
            },
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            time: '10:00 AM',
            status: 'scheduled',
            meetingLink: 'https://meet.google.com/abc-defg-hij',
            reason: 'Routine checkup'
          }
        ]
        setConsultations(mockConsultations)
      }
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setConsultations([])
    }
  }

  const handleBookConsultation = (doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingModal(true)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    if (!bookingDetails.date || !bookingDetails.time || !bookingDetails.reason) {
      showNotification('error', 'Please fill in all required fields')
      return
    }

    try {
      // Generate a Google Meet link
      const meetingId = Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15)
      const meetingLink = `https://meet.google.com/${meetingId}`

      const newConsultation = {
        id: Date.now(),
        doctor: selectedDoctor,
        date: bookingDetails.date,
        time: bookingDetails.time,
        status: 'scheduled',
        meetingLink: meetingLink,
        reason: bookingDetails.reason,
        notes: bookingDetails.notes
      }

      console.log('Booking consultation:', newConsultation)

      // Send to backend
      try {
        const response = await fetch('http://localhost:5000/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            ...newConsultation
          })
        })

        if (response.ok) {
          console.log('Consultation saved to backend successfully')
        } else {
          console.log('Backend save failed, keeping in local state')
        }
      } catch (backendError) {
        console.log('Backend not available, keeping in local state:', backendError)
      }

      // Add to local state regardless of backend response
      setConsultations([newConsultation, ...consultations])
      
      showNotification('success', `Consultation scheduled! Meeting link: ${meetingLink}`)
      setShowBookingModal(false)
      setBookingDetails({ date: '', time: '', reason: '', notes: '' })
      setSelectedDoctor(null)
      setActiveTab('upcoming')
    } catch (error) {
      console.error('Error booking consultation:', error)
      showNotification('error', 'Failed to schedule consultation. Please try again.')
    }
  }

  const handleJoinMeeting = (meetingLink) => {
    if (!meetingLink || meetingLink === 'undefined') {
      showNotification('error', 'Meeting link not available')
      return
    }
    
    console.log('Opening Google Meet:', meetingLink)
    showNotification('success', 'Opening Google Meet in new tab...')
    
    // Open in new tab
    const newWindow = window.open(meetingLink, '_blank', 'noopener,noreferrer')
    
    if (!newWindow) {
      // If popup blocked, try direct navigation
      showNotification('error', 'Please allow popups and try again, or click the blue meeting link instead.')
    }
  }

  const handleCancelConsultation = async (consultationId) => {
    if (!confirm('Are you sure you want to cancel this consultation?')) {
      return
    }

    try {
      // Call backend API
      await fetch(`http://localhost:5000/api/consultations/${consultationId}`, {
        method: 'DELETE'
      })

      setConsultations(consultations.filter(c => c.id !== consultationId))
      showNotification('success', 'Consultation cancelled successfully')
    } catch (error) {
      console.error('Error cancelling consultation:', error)
      showNotification('error', 'Failed to cancel consultation')
    }
  }

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date()
  }

  const upcomingConsultations = consultations.filter(c => isUpcoming(c.date) && c.status === 'scheduled')
  const pastConsultations = consultations.filter(c => !isUpcoming(c.date) || c.status === 'completed' || c.status === 'cancelled')

  return (
    <div className="consultation-page">
      <div className="consultation-container">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="consultation-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <h1>Doctor Consultations</h1>
          <p className="subtitle">Schedule or join virtual consultations with kidney specialists</p>
        </div>

        {/* Tabs */}
        <div className="consultation-tabs">
          <button
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
            Schedule Appointment
          </button>
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
            </svg>
            Upcoming ({upcomingConsultations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            </svg>
            History
          </button>
        </div>

        {/* Content */}
        <div className="consultation-content">
          {activeTab === 'schedule' && (
            <div className="doctors-grid">
              {loading ? (
                <div className="loading-state">Loading doctors...</div>
              ) : (
                doctors.map(doctor => (
                  <div key={doctor.id} className="doctor-card">
                    <div className="doctor-avatar-large">{doctor.avatar}</div>
                    <h3>{doctor.name}</h3>
                    <p className="doctor-specialization">{doctor.specialization}</p>
                    <div className="doctor-details">
                      <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2"/>
                        </svg>
                        <span>{doctor.rating} Rating</span>
                      </div>
                      <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                          <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
                        </svg>
                        <span>{doctor.experience}</span>
                      </div>
                      <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                          <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                        </svg>
                        <span>{doctor.availability}</span>
                      </div>
                      <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/>
                        </svg>
                        <span>{doctor.languages.join(', ')}</span>
                      </div>
                    </div>
                    <button className="book-btn" onClick={() => handleBookConsultation(doctor)}>
                      Book Consultation
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="consultations-list">
              {upcomingConsultations.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                  </svg>
                  <h3>No upcoming consultations</h3>
                  <p>Schedule an appointment with a doctor to get started</p>
                  <button className="primary-btn" onClick={() => setActiveTab('schedule')}>
                    Schedule Now
                  </button>
                </div>
              ) : (
                upcomingConsultations.map(consultation => (
                  <div key={consultation.id} className="consultation-card upcoming">
                    <div className="consultation-header-card">
                      <div className="doctor-info">
                        <div className="doctor-avatar">{consultation.doctor.avatar}</div>
                        <div>
                          <h4>{consultation.doctor.name}</h4>
                          <p>{consultation.doctor.specialization}</p>
                        </div>
                      </div>
                      <span className="status-badge scheduled">Scheduled</span>
                    </div>
                    <div className="consultation-details">
                      <div className="detail-row">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                        </svg>
                        <span>{formatDate(consultation.date)} at {consultation.time}</span>
                      </div>
                      <div className="detail-row">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                          <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                          <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2"/>
                          <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2"/>
                        </svg>
                        <span>Reason: {consultation.reason}</span>
                      </div>
                      {/* Always show meeting link (generate if not exists) */}
                      <div className="meeting-link-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e40af' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2"/>
                          </svg>
                          <span>📹 Google Meet Link:</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="meeting-link-text">
                            <a 
                              href={consultation.meetingLink || `https://meet.google.com/new`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="meeting-link"
                            >
                              {consultation.meetingLink || `https://meet.google.com/${consultation.id || 'new'}`}
                            </a>
                          </span>
                          <button 
                            className="copy-link-btn" 
                            onClick={() => {
                              const link = consultation.meetingLink || `https://meet.google.com/${consultation.id || 'new'}`;
                              navigator.clipboard.writeText(link);
                              showNotification('success', 'Meeting link copied to clipboard!');
                            }}
                            title="Copy meeting link"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="consultation-actions">
                      <button 
                        className="join-meeting-btn" 
                        onClick={() => handleJoinMeeting(consultation.meetingLink || `https://meet.google.com/${consultation.id || 'new'}`)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2"/>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2"/>
                        </svg>
                        Join Google Meet
                      </button>
                      <button className="cancel-btn" onClick={() => handleCancelConsultation(consultation.id)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="consultations-list">
              {pastConsultations.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                  </svg>
                  <h3>No consultation history</h3>
                  <p>Your past consultations will appear here</p>
                </div>
              ) : (
                pastConsultations.map(consultation => (
                  <div key={consultation.id} className="consultation-card past">
                    <div className="consultation-header-card">
                      <div className="doctor-info">
                        <div className="doctor-avatar">{consultation.doctor.avatar}</div>
                        <div>
                          <h4>{consultation.doctor.name}</h4>
                          <p>{consultation.doctor.specialization}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${consultation.status}`}>
                        {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                      </span>
                    </div>
                    <div className="consultation-details">
                      <div className="detail-row">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                        </svg>
                        <span>{formatDate(consultation.date)} at {consultation.time}</span>
                      </div>
                      <div className="detail-row">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                          <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                        </svg>
                        <span>Reason: {consultation.reason}</span>
                      </div>
                      
                      {/* Show meeting link in history too */}
                      <div className="meeting-link-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e40af' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2"/>
                          </svg>
                          <span>📹 Google Meet Link:</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="meeting-link-text">
                            <a 
                              href={consultation.meetingLink || `https://meet.google.com/new`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="meeting-link"
                            >
                              {consultation.meetingLink || `https://meet.google.com/${consultation.id || 'new'}`}
                            </a>
                          </span>
                          <button 
                            className="copy-link-btn" 
                            onClick={() => {
                              const link = consultation.meetingLink || `https://meet.google.com/${consultation.id || 'new'}`;
                              navigator.clipboard.writeText(link);
                              showNotification('success', 'Meeting link copied to clipboard!');
                            }}
                            title="Copy meeting link"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show join button in history for reference */}
                    <div className="consultation-actions">
                      <button 
                        className="join-meeting-btn" 
                        onClick={() => handleJoinMeeting(consultation.meetingLink || `https://meet.google.com/${consultation.id || 'new'}`)}
                        style={{ opacity: consultation.status === 'cancelled' ? 0.6 : 1 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2"/>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2"/>
                        </svg>
                        {consultation.status === 'completed' ? 'View Meeting Link' : 'Join Google Meet'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Book Consultation</h2>
                <button className="close-btn" onClick={() => setShowBookingModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
              
              <div className="doctor-info-modal">
                <div className="doctor-avatar-large">{selectedDoctor?.avatar}</div>
                <div>
                  <h3>{selectedDoctor?.name}</h3>
                  <p>{selectedDoctor?.specialization}</p>
                </div>
              </div>

              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={bookingDetails.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={bookingDetails.time}
                    onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Consultation *</label>
                  <input
                    type="text"
                    value={bookingDetails.reason}
                    onChange={(e) => setBookingDetails({...bookingDetails, reason: e.target.value})}
                    placeholder="e.g., Routine checkup, Follow-up, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({...bookingDetails, notes: e.target.value})}
                    placeholder="Any additional information for the doctor..."
                    rows="3"
                  />
                </div>

                <div className="info-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2"/>
                  </svg>
                  <p>A Google Meet link will be generated and sent to your email. You can join the meeting from the "Upcoming" tab.</p>
                </div>

                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={() => setShowBookingModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorConsultation

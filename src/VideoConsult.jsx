import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './VideoConsult.css'

function VideoConsult({ doctors }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const doctor = doctors.find(d => d.id === parseInt(id))
  
  const [callStatus, setCallStatus] = useState('waiting') // waiting, connecting, connected, ended
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'doctor', text: 'Hello! How can I help you today?', time: '10:00 AM' },
    { id: 2, sender: 'patient', text: 'Hi Doctor, I have been experiencing headaches for the past few days.', time: '10:01 AM' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [patientInfo, setPatientInfo] = useState({
    name: 'John Patient',
    age: '32',
    symptoms: 'Headache, mild fever',
    duration: '3 days'
  })
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callStatus])

  useEffect(() => {
    if (callStatus === 'waiting') {
      setTimeout(() => setCallStatus('connecting'), 2000)
    } else if (callStatus === 'connecting') {
      setTimeout(() => setCallStatus('connected'), 3000)
    }
  }, [callStatus])

  useEffect(() => {
    if (isVideoOn && localVideoRef.current) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        })
        .catch(err => console.log('Camera access denied'))
    }
  }, [isVideoOn, callStatus])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setCallStatus('ended')
    if (timerRef.current) clearInterval(timerRef.current)
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'patient',
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }])
    setNewMessage('')
  }

  const handleStartNewCall = () => {
    setCallStatus('waiting')
    setCallDuration(0)
    setMessages([
      { id: 1, sender: 'doctor', text: 'Hello! How can I help you today?', time: '10:00 AM' }
    ])
  }

  if (!doctor) {
    return (
      <div className="vc-page vc-not-found">
        <h2>Doctor not found</h2>
        <Link to="/find-doctor">Find a Doctor</Link>
      </div>
    )
  }

  return (
    <div className="vc-page">
      {callStatus === 'waiting' && (
        <div className="vc-waiting-room">
          <div className="vc-waiting-card">
            <div className="vc-doctor-preview">
              <div className="vc-avatar-large">{doctor.icon}</div>
              <h2>{doctor.name}</h2>
              <p className="vc-specialty">{doctor.specialty}</p>
              <div className="vc-rating">⭐ {doctor.rating}</div>
            </div>
            
            <div className="vc-patient-info-form">
              <h3>Patient Information</h3>
              <div className="vc-info-grid">
                <div className="vc-info-item">
                  <label>Name</label>
                  <input type="text" value={patientInfo.name} onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})} />
                </div>
                <div className="vc-info-item">
                  <label>Age</label>
                  <input type="text" value={patientInfo.age} onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})} />
                </div>
                <div className="vc-info-item full">
                  <label>Symptoms</label>
                  <textarea value={patientInfo.symptoms} onChange={(e) => setPatientInfo({...patientInfo, symptoms: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="vc-waiting-actions">
              <button className="vc-btn-primary" onClick={() => setCallStatus('connecting')}>
                <span className="vc-icon">📹</span> Join Video Call
              </button>
              <button className="vc-btn-secondary" onClick={() => navigate(`/doctor/${doctor.id}`)}>
                ← Back to Profile
              </button>
            </div>
            
            <div className="vc-waiting-tips">
              <h4>📋 Tips for a better consultation:</h4>
              <ul>
                <li>Ensure good internet connection</li>
                <li>Find a quiet, well-lit place</li>
                <li>Keep your symptoms list ready</li>
                <li>Have any previous medical reports handy</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {callStatus === 'connecting' && (
        <div className="vc-connecting">
          <div className="vc-connecting-card">
            <div className="vc-spinner"></div>
            <h2>Connecting to {doctor.name}...</h2>
            <p>Please wait while we establish a secure connection</p>
            <div className="vc-connection-steps">
              <div className="vc-step active"><span>✓</span> Checking camera</div>
              <div className="vc-step active"><span>✓</span> Checking microphone</div>
              <div className="vc-step active"><span>⟳</span> Connecting to doctor</div>
            </div>
            <button className="vc-btn-cancel" onClick={() => setCallStatus('waiting')}>Cancel</button>
          </div>
        </div>
      )}

      {callStatus === 'connected' && (
        <div className="vc-call-container">
          <div className="vc-main-video">
            <video ref={remoteVideoRef} autoPlay playsInline className="vc-remote-video" />
            <div className="vc-doctor-overlay">
              <div className="vc-avatar">{doctor.icon}</div>
              <span className="vc-doctor-name">{doctor.name}</span>
              <span className="vc-call-timer">{formatTime(callDuration)}</span>
            </div>
            <div className="vc-connection-quality">
              <span className="vc-signal-bars">📶</span> Good Connection
            </div>
          </div>
          
          <div className="vc-local-video-container">
            <video ref={localVideoRef} autoPlay playsInline muted className="vc-local-video" />
            {!isVideoOn && (
              <div className="vc-video-off">
                <span>📷</span>
              </div>
            )}
          </div>

          <div className="vc-patient-panel">
            <div className="vc-patient-header">
              <h3>Patient: {patientInfo.name}</h3>
              <span className="vc-age">Age: {patientInfo.age}</span>
            </div>
            <div className="vc-symptoms">
              <strong>Symptoms:</strong> {patientInfo.symptoms}
            </div>
          </div>

          <div className="vc-controls">
            <button className={`vc-control-btn ${isMuted ? 'active' : ''}`} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? '🔇' : '🎤'}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button className={`vc-control-btn ${!isVideoOn ? 'active' : ''}`} onClick={() => setIsVideoOn(!isVideoOn)}>
              {isVideoOn ? '📹' : '📷'}
              <span>{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
            </button>
            <button className={`vc-control-btn ${isScreenSharing ? 'active' : ''}`} onClick={() => setIsScreenSharing(!isScreenSharing)}>
              🖥️
              <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>
            <button className={`vc-control-btn ${showChat ? 'active' : ''}`} onClick={() => setShowChat(!showChat)}>
              💬
              <span>Chat</span>
            </button>
            <button className="vc-control-btn vc-end-call" onClick={handleEndCall}>
              📞
              <span>End Call</span>
            </button>
          </div>

          {showChat && (
            <div className="vc-chat-panel">
              <div className="vc-chat-header">
                <h3>Chat</h3>
                <button onClick={() => setShowChat(false)}>✕</button>
              </div>
              <div className="vc-chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`vc-message ${msg.sender}`}>
                    <div className="vc-message-bubble">{msg.text}</div>
                    <div className="vc-message-time">{msg.time}</div>
                  </div>
                ))}
              </div>
              <div className="vc-chat-input">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}

      {callStatus === 'ended' && (
        <div className="vc-call-ended">
          <div className="vc-ended-card">
            <div className="vc-ended-icon">✓</div>
            <h2>Consultation Completed</h2>
            <div className="vc-call-summary">
              <div className="vc-summary-item">
                <span className="vc-label">Duration</span>
                <span className="vc-value">{formatTime(callDuration)}</span>
              </div>
              <div className="vc-summary-item">
                <span className="vc-label">Doctor</span>
                <span className="vc-value">{doctor.name}</span>
              </div>
              <div className="vc-summary-item">
                <span className="vc-label">Specialty</span>
                <span className="vc-value">{doctor.specialty}</span>
              </div>
            </div>
            
            <div className="vc-follow-up">
              <h3>Follow-up Options</h3>
              <div className="vc-follow-up-btns">
                <button className="vc-btn-primary" onClick={handleStartNewCall}>
                  📹 Book Another Consultation
                </button>
                <button className="vc-btn-secondary" onClick={() => navigate(`/doctor/${doctor.id}`)}>
                  View Doctor Profile
                </button>
                <button className="vc-btn-outline" onClick={() => navigate('/find-doctor')}>
                  Find Another Doctor
                </button>
              </div>
            </div>

            <div className="vc-prescription-note">
              <p>💊 If the doctor has prescribed any medication, it will be sent to your registered email.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoConsult

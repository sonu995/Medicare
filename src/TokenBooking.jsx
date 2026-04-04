import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import './TokenBooking.css'

function TokenBooking({ doctors, tokenBookings, onBookToken, tokenStates }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [step, setStep] = useState(1)
    const [session, setSession] = useState(searchParams.get('session') || 'morning')
    const [visitType, setVisitType] = useState(searchParams.get('type') || 'clinic')
    const [confirmedToken, setConfirmedToken] = useState(null)
    const [patientName, setPatientName] = useState('')
    const [patientPhone, setPatientPhone] = useState('')
    const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0])
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [step])

    const doctor = doctors.find(d => (d._id === id || d.id?.toString() === id))

    if (!doctor) return <div className="tb-error">Doctor not found. <button onClick={() => navigate('/find-doctor')}>Go Back</button></div>

    const docId = doctor._id || doctor.id
    const sessionData = doctor.schedule[session]
    
    const issuedCount = (tokenBookings || []).filter(b => {
        const bDocId = (b.doctorId?._id || b.doctorId)?.toString()
        const bTargetId = docId?.toString()
        const bDate = b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : ''
        return bDocId === bTargetId && b.session === session && bDate === bookingDate
    }).length
    const state = tokenStates[docId] || {}
    const currentToken = state.currentToken || 1
    const tokensLeft = sessionData.totalTokens - issuedCount
    const myTokenNumber = issuedCount + 1
    const estimatedWait = Math.max(0, (myTokenNumber - currentToken)) * sessionData.tokenDuration

    const isSessionActive = (sess) => {
        const sd = doctor.schedule[sess]
        if (!sd || !sd.active) return false
        
        const today = new Date().toISOString().split('T')[0]
        if (bookingDate > today) return true
        if (bookingDate < today) return false
        
        const now = new Date()
        const [endH, endM] = sd.end.split(':').map(Number)
        const endTime = new Date()
        endTime.setHours(endH, endM, 0, 0)
        
        return now < endTime
    }

    const handleConfirm = async () => {
        if (!patientName.trim() || !patientPhone.trim()) {
            alert('Please enter your name and phone number.')
            return
        }
        if (tokensLeft <= 0) {
            alert('Sorry! All tokens are booked. Please try another session.')
            return
        }

        setIsBooking(true)
        setError(null)
        try {
            const token = await onBookToken(doctor._id || doctor.id, session, visitType, patientName, patientPhone, bookingDate)
            if (token && !token.error) {
                setConfirmedToken(token)
                setStep(3)
            } else {
                setError(token?.error || 'Booking failed. Please try again.')
            }
        } catch {
            setError('An unexpected error occurred.')
        } finally {
            setIsBooking(false)
        }
    }

    const tokensToWait = confirmedToken ? (confirmedToken.tokenNumber - currentToken) : 0
    const liveEstWait = tokensToWait > 0 ? tokensToWait * sessionData.tokenDuration : 0
    const progressPercent = confirmedToken ? Math.min(100, (currentToken / confirmedToken.tokenNumber) * 100) : 0

    const getLiveStatus = () => {
        if (tokensToWait < 0) return { class: 'completed', text: 'Your appointment is completed!', icon: '✅' }
        if (tokensToWait === 0) return { class: 'serving', text: 'You are being served now!', icon: '🔔' }
        return { class: '', text: `${tokensToWait} patient(s) ahead of you`, icon: '⏳' }
    }

    const liveStatus = confirmedToken ? getLiveStatus() : null

    return (
        <div className="token-booking-page">
            <div className="tb-container">
                <button className="tb-back-btn" onClick={() => step > 1 ? setStep(step - 1) : navigate(`/doctor/${doctor._id || doctor.id}`)}>← Back</button>

                <div className="tb-progress">
                    {['Choose Session', 'Your Details', 'Live Tracking'].map((label, i) => (
                        <div key={i} className={`tb-progress-step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                            <div className="tb-step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                <div className="tb-doc-mini">
                    <span className="tb-doc-icon">{doctor.icon}</span>
                    <div>
                        <strong>{doctor.name}</strong>
                        <p>{doctor.specialty} · {doctor.clinicName}</p>
                    </div>
                </div>

                {step === 1 && (
                    <div className="tb-step-card">
                        <h2>Select Date, Session & Visit Type</h2>

                        <div className="tb-section">
                            <label className="tb-label">📅 Choose Appointment Date</label>
                            <input 
                                type="date" 
                                className="tb-date-input"
                                min={new Date().toISOString().split('T')[0]}
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                            />
                        </div>

                        <div className="tb-section">
                            <label className="tb-label">📅 Choose OPD Session</label>
                            <div className="tb-option-grid">
                                {['morning', 'evening'].filter(s => doctor.schedule[s]?.active).map(s => {
                                    const docId = doctor._id || doctor.id
                                    const sd = doctor.schedule[s]
                                    const cnt = (tokenBookings || []).filter(b => {
                                        const bDocId = (b.doctorId?._id || b.doctorId)?.toString()
                                        const bTargetId = docId?.toString()
                                        const bDate = b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : ''
                                        return bDocId === bTargetId && b.session === s && bDate === bookingDate
                                    }).length
                                    const left = sd.totalTokens - cnt
                                    const active = isSessionActive(s)
                                    return (
                                        <button
                                            key={s}
                                            className={`tb-option-card ${session === s ? 'selected' : ''} ${!active || left <= 0 ? 'disabled-option' : ''}`}
                                            onClick={() => active && left > 0 && setSession(s)}
                                        >
                                            <span className="opt-icon">{s === 'morning' ? '🌅' : '🌙'}</span>
                                            <span className="opt-name">{s === 'morning' ? 'Morning OPD' : 'Evening OPD'}</span>
                                            <span className="opt-time">{sd.start} – {sd.end}</span>
                                            <span className={`opt-tokens ${left <= 5 ? 'low-tokens' : ''}`}>
                                                {!active ? '🚫 Expired' : left > 0 ? `${left} tokens left` : '🚫 Full'}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="tb-section">
                            <label className="tb-label">🩺 Visit Type</label>
                            <div className="tb-option-grid">
                                <button className={`tb-option-card ${visitType === 'clinic' ? 'selected' : ''}`} onClick={() => setVisitType('clinic')}>
                                    <span className="opt-icon">🏥</span>
                                    <span className="opt-name">Clinic Visit</span>
                                    <span className="opt-desc">Visit the clinic in-person</span>
                                </button>
                                <button className={`tb-option-card ${visitType === 'online' ? 'selected' : ''}`} onClick={() => setVisitType('online')}>
                                    <span className="opt-icon">📹</span>
                                    <span className="opt-name">Video Consult</span>
                                    <span className="opt-desc">Consult from your home</span>
                                </button>
                            </div>
                        </div>

                        <div className="tb-token-preview">
                            <div className="tp-row">
                                <span>Your Token Number</span>
                                <strong className="tp-num">#{issuedCount + 1}</strong>
                            </div>
                            <div className="tp-row">
                                <span>Estimated Wait</span>
                                <strong>~{estimatedWait} minutes</strong>
                            </div>
                            <div className="tp-row">
                                <span>Session Time</span>
                                <strong>{sessionData.start} – {sessionData.end}</strong>
                            </div>
                        </div>

                        <button className="tb-next-btn" onClick={() => setStep(2)}>Continue →</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="tb-step-card">
                        <h2>Your Details</h2>
                        <p className="tb-subtitle">We'll send your token confirmation on this number.</p>

                        <div className="tb-form">
                            <div className="tb-form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Enter your full name" value={patientName} onChange={e => setPatientName(e.target.value)} />
                            </div>
                            <div className="tb-form-group">
                                <label>Phone Number</label>
                                <input type="tel" placeholder="+91 XXXXX XXXXX" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} />
                            </div>
                        </div>

                        <div className="tb-summary-box">
                            <h4>Booking Summary</h4>
                            <div className="summary-row"><span>Doctor</span><strong>{doctor.name}</strong></div>
                            <div className="summary-row"><span>Session</span><strong>{session === 'morning' ? 'Morning OPD' : 'Evening OPD'} ({sessionData.start} – {sessionData.end})</strong></div>
                            <div className="summary-row"><span>Visit Type</span><strong>{visitType === 'clinic' ? '🏥 Clinic Visit' : '📹 Video Consult'}</strong></div>
                            <div className="summary-row"><span>Date</span><strong>{new Date(bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                            <div className="summary-row"><span>Token #</span><strong className="summary-token">#{myTokenNumber}</strong></div>
                            <div className="summary-row"><span>Est. Wait</span><strong>~{estimatedWait} min</strong></div>
                        </div>

                        {error && <div className="tb-error-msg">⚠️ {error}</div>}

                        <button 
                            className={`tb-confirm-btn ${isBooking ? 'loading' : ''}`} 
                            onClick={handleConfirm}
                            disabled={isBooking}
                        >
                            {isBooking ? '⌛ Processing...' : '✅ Confirm & Get Token'}
                        </button>
                    </div>
                )}

                {step === 3 && confirmedToken && (
                    <div className="tb-confirmed-card">
                        <div className="confirmed-anim">🎉</div>
                        <h2>Token Booked Successfully!</h2>
                        <p>Your appointment is confirmed with <strong>{doctor.name}</strong></p>

                        <div className="tb-live-token-card">
                            <div className="ltc-header">
                                <div className="ltc-patient">
                                    <span className="ltc-icon">👤</span>
                                    <div>
                                        <span className="ltc-label">Patient Name</span>
                                        <span className="ltc-value">{confirmedToken.patientName}</span>
                                    </div>
                                </div>
                                <div className="ltc-token">
                                    <span className="ltc-token-num">#{confirmedToken.tokenNumber}</span>
                                    <span className="ltc-token-label">Your Token</span>
                                </div>
                            </div>
                            
                            <div className="ltc-doctor">
                                <span className="ltc-icon">👨‍⚕️</span>
                                <div>
                                    <span className="ltc-label">Doctor</span>
                                    <span className="ltc-value">{doctor.name}</span>
                                    <span className="ltc-sub">{doctor.specialty}</span>
                                </div>
                            </div>

                            <div className="ltc-divider"></div>

                            <div className="ltc-live-section">
                                <div className="ltc-live-header">
                                    <span className="live-dot"></span>
                                    <span>LIVE TRACKING</span>
                                </div>

                                <div className="ltc-status-grid">
                                    <div className="ltc-status-box ltc-current">
                                        <span className="lsb-label">Currently Serving</span>
                                        <span className="lsb-value">#{currentToken}</span>
                                    </div>
                                    <div className="ltc-status-box ltc-yours">
                                        <span className="lsb-label">Your Token</span>
                                        <span className="lsb-value">#{confirmedToken.tokenNumber}</span>
                                    </div>
                                </div>

                                <div className={`ltc-wait ${liveStatus?.class}`}>
                                    <span className="ltc-wait-icon">{liveStatus?.icon}</span>
                                    <div className="ltc-wait-info">
                                        <span className="ltc-wait-text">{liveStatus?.text}</span>
                                        {tokensToWait > 0 && (
                                            <span className="ltc-wait-time">Est. wait: ~{liveEstWait} min</span>
                                        )}
                                    </div>
                                </div>

                                <div className="ltc-progress">
                                    <div className="ltc-progress-bar">
                                        <div className="ltc-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <div className="ltc-progress-labels">
                                        <span>#{currentToken}</span>
                                        <span>#{confirmedToken.tokenNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="ltc-divider"></div>

                            <div className="ltc-details-grid">
                                <div className="ltc-detail">
                                    <span className="ld-icon">📅</span>
                                    <div>
                                        <span className="ld-label">Date</span>
                                        <span className="ld-value">{new Date(confirmedToken.bookingDate || bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="ltc-detail">
                                    <span className="ld-icon">⏰</span>
                                    <div>
                                        <span className="ld-label">Session</span>
                                        <span className="ld-value">{confirmedToken.session === 'morning' ? 'Morning OPD' : 'Evening OPD'}</span>
                                    </div>
                                </div>
                                <div className="ltc-detail">
                                    <span className="ld-icon">{confirmedToken.visitType === 'online' ? '📹' : '🏥'}</span>
                                    <div>
                                        <span className="ld-label">Visit Type</span>
                                        <span className="ld-value">{confirmedToken.visitType === 'online' ? 'Video Consult' : 'Clinic Visit'}</span>
                                    </div>
                                </div>
                                <div className="ltc-detail">
                                    <span className="ld-icon">🔖</span>
                                    <div>
                                        <span className="ld-label">Token ID</span>
                                        <span className="ld-value">{confirmedToken.tokenId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="tb-actions">
                            <button className="tb-track-btn" onClick={() => navigate(`/live-tracking?doctorId=${docId}&session=${session}&type=${visitType}`)}>📡 Track Live</button>
                            <button className="tb-home-btn" onClick={() => navigate('/')}>🏠 Home</button>
                            <button className="tb-find-btn" onClick={() => navigate('/find-doctor')}>Find More Doctors</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TokenBooking

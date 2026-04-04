import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './DoctorProfile.css'
import * as doctorsApi from './api/doctorsApi'

function DoctorProfile({ doctors = [], tokenBookings = [], tokenStates = {} }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeSession, setActiveSession] = useState('morning')

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        const existing = doctors.find(d => (d._id === id || d.id?.toString() === id))
        if (existing) {
            setDoctor(existing)
            const firstActive = ['morning', 'evening'].find(s => existing.schedule[s]?.active) || 'morning'
            setActiveSession(firstActive)
            setLoading(false)
        } else {
            const loadDoctor = async () => {
                try {
                    const res = await doctorsApi.fetchDoctor(id)
                    if (res.success) {
                         setDoctor(res.data)
                         const firstActive = ['morning', 'evening'].find(s => res.data.schedule[s]?.active) || 'morning'
                         setActiveSession(firstActive)
                    }
                } catch (err) { console.error('Failed to load doctor:', err) }
                finally { setLoading(false) }
            }
            loadDoctor()
        }
    }, [id, doctors])

    if (loading) return (
        <div className="dp-loading">
            <div className="spinner"></div>
            <p>Loading Doctor Profile...</p>
        </div>
    )

    if (!doctor) return (
        <div className="dp-not-found">
            <h2>Doctor not found</h2>
            <button onClick={() => navigate('/find-doctor')}>← Back</button>
        </div>
    )

    const session = doctor.schedule[activeSession]
    const docId = doctor._id || doctor.id
    const state = tokenStates[docId] || {}
    const issuedCount = (tokenBookings || []).filter(b => (b.doctorId === docId || b.doctorId?._id === docId) && b.session === activeSession).length
    const currentToken = state.currentToken || 1
    const opdStatus = state.status || 'open'
    const tokensLeft = session.totalTokens - issuedCount

    const getStatusBadge = () => {
        if (opdStatus === 'closed') return { label: 'OPD Closed', cls: 'badge-closed' }
        if (opdStatus === 'paused') return { label: '⏸ Break / Paused', cls: 'badge-paused' }
        if (tokensLeft <= 0) return { label: 'Fully Booked', cls: 'badge-full' }
        return { label: '🟢 Open Now', cls: 'badge-open' }
    }
    const badge = getStatusBadge()

return (
        <div className="doctor-profile-page">
            {/* Hero Banner */}
            <div className="dp-banner">
                <button className="dp-back-btn" onClick={() => navigate('/find-doctor')}>← Back to Doctors</button>
                <div className="dp-header-card">
                    <div className="dp-avatar">{doctor.icon}</div>
                    <div className="dp-header-info">
                        <h1>{doctor.name}</h1>
                        <p className="dp-specialty">{doctor.specialty}</p>
                        <p className="dp-clinic">🏥 {doctor.clinicName} · 📍 {doctor.location}</p>
                        <div className="dp-meta-row">
                            <span className="dp-tag">⭐ {doctor.rating}</span>
                            <span className="dp-tag">🕒 {doctor.experience}</span>
                            <span className={`dp-tag dp-status-tag ${badge.cls}`}>{badge.label}</span>
                        </div>
                        {doctor.qualifications && (
                            <div className="dp-qualifications">
                                {doctor.qualifications.map((q, i) => (
                                    <span key={i} className="qualification-badge">{q}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dp-content-grid">
                {/* Token Status Panel */}
                <div className="dp-main">
                    {/* Bio Section */}
                    {doctor.bio && (
                        <div className="dp-section-card">
                            <h3>📋 About Dr. {doctor.name.split(' ').slice(-1)[0]}</h3>
                            <p className="dp-bio-text">{doctor.bio}</p>
                            
                            {doctor.education && (
                                <div className="dp-info-row">
                                    <span className="info-label">🎓 Education:</span>
                                    <span className="info-value">{doctor.education}</span>
                                </div>
                            )}
                            
                            {doctor.languages && (
                                <div className="dp-info-row">
                                    <span className="info-label">🗣 Languages:</span>
                                    <span className="info-value">{doctor.languages.join(', ')}</span>
                                </div>
                            )}
                            
                            {doctor.achievements && doctor.achievements.length > 0 && (
                                <div className="dp-achievements">
                                    <span className="info-label">🏆 Achievements:</span>
                                    <div className="achievement-tags">
                                        {doctor.achievements.map((a, i) => (
                                            <span key={i} className="achievement-tag">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Session Tabs */}
                    <div className="dp-session-tabs">
                        {['morning', 'evening'].filter(s => doctor.schedule[s].active).map(s => (
                            <button
                                key={s}
                                className={`dp-session-tab ${activeSession === s ? 'active' : ''}`}
                                onClick={() => setActiveSession(s)}
                            >
                                {s === 'morning' ? '🌅' : '🌙'} {s.charAt(0).toUpperCase() + s.slice(1)} OPD
                                <span className="tab-time">{doctor.schedule[s].start} – {doctor.schedule[s].end}</span>
                            </button>
                        ))}
                    </div>

                    {/* Live Token Board */}
                    <div className="dp-token-board">
                        <div className="token-board-header">
                            <h3>Today's Token Status</h3>
                            <span className={`opd-badge ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <div className="token-stats-row">
                            <div className="token-stat-card current-token">
                                <span className="ts-label">Currently Serving</span>
                                <span className="ts-value big-token"># {currentToken}</span>
                            </div>
                            <div className="token-stat-card">
                                <span className="ts-label">Tokens Issued</span>
                                <span className="ts-value">{issuedCount} / {session.totalTokens}</span>
                            </div>
                            <div className="token-stat-card">
                                <span className="ts-label">Tokens Left</span>
                                <span className={`ts-value ${tokensLeft <= 5 ? 'text-red' : 'text-green'}`}>{tokensLeft}</span>
                            </div>
                            <div className="token-stat-card">
                                <span className="ts-label">Avg. Wait / Token</span>
                                <span className="ts-value">{session.tokenDuration} min</span>
                            </div>
                        </div>

                        {/* Live Queue Progress Bar */}
                        <div className="queue-progress-wrap">
                            <div className="queue-progress-bar">
                                <div className="queue-progress-fill" style={{ width: `${(issuedCount / session.totalTokens) * 100}%` }}></div>
                            </div>
                            <span className="queue-progress-label">{Math.round((issuedCount / session.totalTokens) * 100)}% filled</span>
                        </div>
                    </div>

                    {/* Upcoming Tokens Preview */}
                    <div className="dp-queue-preview">
                        <h4>Live Queue (Next 5 tokens)</h4>
                        <div className="queue-chips">
                            {Array.from({ length: 5 }, (_, i) => currentToken + i).map(t => (
                                <div key={t} className={`queue-chip ${t === currentToken ? 'chip-current' : t === currentToken + 1 ? 'chip-next' : 'chip-waiting'}`}>
                                    <span className="chip-num">#{t}</span>
                                    <span className="chip-label">{t === currentToken ? '🔵 Now' : t === currentToken + 1 ? '🟡 Next' : '⚪'}</span>
                                    <span className="chip-wait">~{(t - currentToken) * session.tokenDuration} min</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Booking Sidebar */}
                <div className="dp-sidebar">
                    <div className="dp-booking-card">
                        <h3>Book Your Token</h3>
                        <p className="dp-book-desc">Get a digital token and visit at your estimated time. No long waiting!</p>

                        {tokensLeft > 0 && opdStatus === 'open' ? (
                            <>
                                <div className="dp-next-token-preview">
                                    <span>Your Token Would Be</span>
                                    <strong className="next-token-num"># {issuedCount + 1}</strong>
                                    <span className="est-wait">~{(issuedCount + 1 - currentToken) * session.tokenDuration} min wait</span>
                                </div>
                                <button className="dp-book-btn clinic" onClick={() => navigate(`/book-token/${doctor._id || doctor.id}?session=${activeSession}&type=clinic`)}>
                                    🏥 Book Clinic Visit
                                </button>
                                <button className="dp-book-btn online" onClick={() => navigate(`/video-consult/${doctor._id || doctor.id}`)}>
                                    📹 Start Video Consult
                                </button>
                            </>
                        ) : (
                            <div className="dp-no-tokens">
                                <span>😔</span>
                                <p>{opdStatus === 'paused' ? 'OPD is currently on a break. Please check back soon.' : 'All tokens for this session are booked. Try another session.'}</p>
                            </div>
                        )}
                    </div>

                    <div className="dp-info-card">
                        <h4>Schedule</h4>
                        {['morning', 'evening'].filter(s => doctor.schedule[s].active).map(s => (
                            <div key={s} className="schedule-row">
                                <span>{s === 'morning' ? '🌅' : '🌙'} {s.charAt(0).toUpperCase() + s.slice(1)}</span>
                                <span>{doctor.schedule[s].start} – {doctor.schedule[s].end}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorProfile

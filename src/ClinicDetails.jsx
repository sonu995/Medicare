import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './ClinicDetails.css'

function ClinicDetails({ clinics, doctors, tokenBookings = [], tokenStates = {} }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const clinic = clinics.find(c => c.id === id || c._id === id)
    const [searchDoc, setSearchDoc] = useState('')

    if (!clinic) {
        return (
            <div className="cd-page">
                <div className="cd-container cd-not-found">
                    <div className="cd-not-found-icon">🏥</div>
                    <h2>Clinic not found</h2>
                    <p>The clinic you're looking for doesn't exist.</p>
                    <Link to="/find-doctor" className="cd-back-btn">
                        ← Back to Find Doctors
                    </Link>
                </div>
            </div>
        )
    }

    const filteredClinicDocs = clinic.doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchDoc.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchDoc.toLowerCase())
    )

    const getDoctorId = (doc, index) => {
        const fullDoc = doctors.find(d => d.name === doc.name)
        if (fullDoc) return fullDoc.id || fullDoc._id
        return `clinic-${clinic.id || clinic._id}-${index}`
    }

    const handleBookClick = (doc, index) => {
        const docId = getDoctorId(doc, index)
        navigate(`/book-token/${docId}`)
    }

    return (
        <div className="cd-page">
            <section className="cd-hero">
                <div className="cd-hero-bg">
                    <div className="cd-blob cd-blob-1"></div>
                    <div className="cd-blob cd-blob-2"></div>
                </div>
                <div className="cd-container">
                    <Link to="/find-doctor" className="cd-back-link">← Back to Clinics</Link>
                    
                    <div className="cd-clinic-header">
                        <div className="cd-clinic-icon-wrap">
                            <span className="cd-clinic-icon">{clinic.icon}</span>
                        </div>
                        <div className="cd-clinic-info">
                            <div className="cd-clinic-badge-row">
                                <span className={`cd-status-badge ${clinic.status}`}>
                                    {clinic.status === 'open' ? '🟢 Open Now' : '🔴 Closed'}
                                </span>
                                <span className="cd-review-badge">⭐ {clinic.rating}</span>
                            </div>
                            <h1 className="cd-clinic-name">{clinic.name}</h1>
                            <div className="cd-clinic-meta">
                                <span>📍 {clinic.address}</span>
                                <span>📞 {clinic.phone}</span>
                                <span>🕐 {clinic.timings}</span>
                            </div>
                            <p className="cd-reviews-text">{clinic.reviews} patient reviews</p>
                        </div>
                        <Link to={`/clinic-admin/${clinic._id || clinic.id}`} className="cd-admin-link">
                            ⚙️ Admin Panel
                        </Link>
                    </div>

                    <div className="cd-tags-section">
                        <div className="cd-tags-group">
                            <span className="cd-tags-label">Specialties:</span>
                            {clinic.specialties.map(s => (
                                <span key={s} className="cd-tag cd-tag-specialty">{s}</span>
                            ))}
                        </div>
                        <div className="cd-tags-group">
                            <span className="cd-tags-label">Facilities:</span>
                            {clinic.facilities.map(f => (
                                <span key={f} className="cd-tag cd-tag-facility">✓ {f}</span>
                            ))}
                        </div>
                    </div>

                    <div className="cd-search-box">
                        <span className="cd-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialty..."
                            value={searchDoc}
                            onChange={(e) => setSearchDoc(e.target.value)}
                            className="cd-search-input"
                        />
                    </div>
                </div>
            </section>

            <section className="cd-doctors-section">
                <div className="cd-container">
                    <div className="cd-section-header">
                        <div>
                            <h2>Our Doctors</h2>
                            <p>Expert healthcare professionals at {clinic.name}</p>
                        </div>
                        <span className="cd-doctor-count">{filteredClinicDocs.length} Doctors Available</span>
                    </div>

                    {filteredClinicDocs.length > 0 ? (
                        <div className="cd-doctors-grid">
                            {filteredClinicDocs.map((doc, index) => {
                                const fullDoc = doctors.find(d => d.name === doc.name) || {
                                    id: index + 100,
                                    name: doc.name,
                                    specialty: doc.specialty,
                                    experience: doc.experience,
                                    rating: doc.rating,
                                    icon: doc.icon,
                                    schedule: {
                                        morning: { start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: doc.morning !== 'Not Available' },
                                        evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: doc.evening !== 'Not Available' }
                                    }
                                }

                                const fullDocId = fullDoc._id || fullDoc.id
                                const morningBooked = tokenBookings.filter(b => (b.doctorId === fullDocId || b.doctorId?._id === fullDocId) && b.session === 'morning').length
                                const eveningBooked = tokenBookings.filter(b => (b.doctorId === fullDocId || b.doctorId?._id === fullDocId) && b.session === 'evening').length
                                const state = tokenStates[fullDocId] || { status: 'open' }
                                const mLeft = fullDoc.schedule?.morning ? fullDoc.schedule.morning.totalTokens - morningBooked : 0
                                const eLeft = fullDoc.schedule?.evening ? fullDoc.schedule.evening.totalTokens - eveningBooked : 0
                                const hasTokens = mLeft > 0 || eLeft > 0
                                
                                const today = new Date().toISOString().split('T')[0]
                                const isOnVacation = fullDoc.vacation?.isOnVacation && 
                                    fullDoc.vacation.vacationStart <= today && 
                                    fullDoc.vacation.vacationEnd >= today
                                const isOnLeave = fullDoc.leave?.some(l => l.date === today)
                                const isUnavailable = isOnVacation || isOnLeave

                                return (
                                    <div key={index} className="cd-doctor-card">
                                        {isUnavailable && (
                                            <div className="cd-unavailable-badge">
                                                {isOnVacation ? '🏖️ On Vacation' : '📴 On Leave'}
                                            </div>
                                        )}
                                        
                                        <div className="cd-doctor-top">
                                            <div className="cd-doctor-avatar">
                                                <span>{doc.icon}</span>
                                            </div>
                                            <div className="cd-doctor-info">
                                                <h3>{doc.name}</h3>
                                                <span className="cd-specialty-tag">{doc.specialty}</span>
                                                <div className="cd-doctor-meta">
                                                    <span>🎓 {doc.experience}</span>
                                                    <span>⭐ {doc.rating}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cd-schedule-section">
                                            <h4>📅 Availability</h4>
                                            <div className="cd-schedule-grid">
                                                <div className="cd-schedule-item">
                                                    <span className="cd-schedule-label">🌅 Morning</span>
                                                    <span className={`cd-schedule-value ${doc.morning === 'Not Available' ? 'unavailable' : ''}`}>
                                                        {doc.morning}
                                                    </span>
                                                </div>
                                                <div className="cd-schedule-item">
                                                    <span className="cd-schedule-label">🌙 Evening</span>
                                                    <span className={`cd-schedule-value ${doc.evening === 'Not Available' ? 'unavailable' : ''}`}>
                                                        {doc.evening}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cd-token-status">
                                            <div className={`cd-token-badge ${hasTokens && state.status === 'open' ? 'available' : 'full'}`}>
                                                {state.status === 'paused' ? '⏸️ On Break' : hasTokens ? '🟢 Tokens Available' : '🔴 Fully Booked'}
                                            </div>
                                            <div className="cd-token-info">
                                                {fullDoc.schedule?.morning?.active && (
                                                    <span className={`cd-token-session ${mLeft <= 0 ? 'full' : ''}`}>
                                                        🌅 {mLeft > 0 ? `${mLeft} left` : 'Full'}
                                                    </span>
                                                )}
                                                {fullDoc.schedule?.evening?.active && (
                                                    <span className={`cd-token-session ${eLeft <= 0 ? 'full' : ''}`}>
                                                        🌙 {eLeft > 0 ? `${eLeft} left` : 'Full'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="cd-doctor-actions">
                                            <button
                                                className="cd-book-btn"
                                                onClick={() => handleBookClick(doc, index)}
                                                disabled={!hasTokens || isUnavailable}
                                            >
                                                {isUnavailable ? (isOnVacation ? '🏖️ On Vacation' : '📴 On Leave') : '📅 Book Token'}
                                            </button>
                                            <Link to={`/doctor/${fullDocId}`} className="cd-profile-btn">
                                                View Profile →
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="cd-empty-state">
                            <span className="cd-empty-icon">🔍</span>
                            <h3>No doctors found</h3>
                            <p>Try a different search term</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default ClinicDetails
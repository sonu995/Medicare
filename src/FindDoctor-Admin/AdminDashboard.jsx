import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import WalkInAnalytics from './components/WalkInAnalytics'

function AdminDashboard({ doctors, clinics, tokenBookings, patients, tokenStates, onAddDoctor, onUpdateDoctor, onDeleteDoctor, onAddClinic, onUpdateClinic, onDeleteClinic, onBookToken, onUpdateBookingStatus }) {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDoctorModal, setShowDoctorModal] = useState(false)
    const [showClinicModal, setShowClinicModal] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState(null)
    const [editingClinic, setEditingClinic] = useState(null)
    const [selectedDoctorId, setSelectedDoctorId] = useState(null)
    const [selectedClinicId, setSelectedClinicId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterSpecialty, setFilterSpecialty] = useState('All')
    const [filterLocation, setFilterLocation] = useState('')
    const [appSearchQuery, setAppSearchQuery] = useState('')
    const [appDateFilter, setAppDateFilter] = useState('')

    const [doctorForm, setDoctorForm] = useState({
        name: '', specialty: '', experience: '', rating: '', location: '', clinicName: '', clinicId: '', icon: '👨‍⚕️', available: 'Today',
        qualifications: '', education: '', bio: '', languages: '', fee: '',
        schedule: {
            morning: { start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: true },
            evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: true }
        }
    })

    const [clinicForm, setClinicForm] = useState({
        name: '', address: '', location: '', phone: '', emergency: '', rating: '', reviews: '', icon: '🏥', timings: '',
        specialties: '', facilities: '', tokensAvailable: '', status: 'open', doctors: []
    })

    const getBookingDate = (booking) => {
        try {
            const timestamp = parseInt(booking.tokenId?.slice(3), 16)
            if (isNaN(timestamp)) return new Date()
            return new Date(timestamp)
        } catch { return new Date() }
    }

    const todayBookings = useMemo(() => {
        const today = new Date().toDateString()
        return tokenBookings.filter(b => {
          const bDate = b.bookingDate ? new Date(b.bookingDate) : getBookingDate(b)
          return bDate.toDateString() === today
        })
    }, [tokenBookings])

    const filteredAppointments = useMemo(() => {
        return tokenBookings.filter(b => {
            const matchesSearch = b.patientName.toLowerCase().includes(appSearchQuery.toLowerCase()) || 
                                b.patientPhone.includes(appSearchQuery) ||
                                b.tokenId?.toLowerCase().includes(appSearchQuery.toLowerCase())
            const bDate = b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : getBookingDate(b).toISOString().split('T')[0]
            const matchesDate = !appDateFilter || bDate === appDateFilter
            return matchesSearch && matchesDate
        })
    }, [tokenBookings, appSearchQuery, appDateFilter])

    const allSpecialties = ['All', ...new Set(doctors.map(d => d.specialty))]
    const allLocations = ['', ...new Set([...doctors.map(d => d.location), ...clinics.map(c => c.location)])]

    const filteredDoctors = doctors.filter(d => {
        const matchStatus = d.status === 'approved' || !d.status
        const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        const matchSpec = filterSpecialty === 'All' || d.specialty === filterSpecialty
        const matchLoc = !filterLocation || d.location.toLowerCase().includes(filterLocation.toLowerCase())
        return matchStatus && matchSearch && matchSpec && matchLoc
    })

    const pendingDoctors = doctors.filter(d => d.status === 'pending')

    const filteredClinics = clinics.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchLoc = !filterLocation || c.location.toLowerCase().includes(filterLocation.toLowerCase())
        return matchSearch && matchLoc
    })

    const doctorStats = useMemo(() => {
        return {
            total: doctors.length,
            available: doctors.filter(d => d.available === 'Today').length,
            online: doctors.filter(d => d.isOnlineDoctor).length,
            bySpecialty: doctors.reduce((acc, d) => { acc[d.specialty] = (acc[d.specialty] || 0) + 1; return acc }, {})
        }
    }, [doctors])

    const clinicStats = useMemo(() => {
        return {
            total: clinics.length,
            open: clinics.filter(c => c.status === 'open').length,
            totalDoctors: clinics.reduce((sum, c) => sum + (c.doctors?.length || 0), 0),
            byLocation: clinics.reduce((acc, c) => { acc[c.location] = (acc[c.location] || 0) + 1; return acc }, {})
        }
    }, [clinics])

    const bookingStats = useMemo(() => {
        return {
            total: tokenBookings.length,
            today: todayBookings.length,
            morning: todayBookings.filter(b => b.session === 'morning').length,
            evening: todayBookings.filter(b => b.session === 'evening').length,
            clinic: todayBookings.filter(b => b.visitType === 'clinic').length,
            online: todayBookings.filter(b => b.visitType === 'online').length
        }
    }, [tokenBookings, todayBookings])

    const selectedDoctor = useMemo(() => 
        selectedDoctorId ? doctors.find(d => (d._id === selectedDoctorId || d.id?.toString() === selectedDoctorId?.toString())) : null,
    [doctors, selectedDoctorId])

    const selectedClinic = useMemo(() => 
        selectedClinicId ? clinics.find(c => (c._id === selectedClinicId || c.id?.toString() === selectedClinicId?.toString())) : null,
    [clinics, selectedClinicId])

    const handleSaveDoctor = () => {
        if (!doctorForm.name || !doctorForm.specialty || !doctorForm.location) {
            alert('Please fill Name, Specialty, Location')
            return
        }
        const doctorData = {
            ...doctorForm,
            clinicId: doctorForm.clinicId || null,
            _id: editingDoctor?._id || editingDoctor?.id,
            qualifications: doctorForm.qualifications ? doctorForm.qualifications.split(',').map(q => q.trim()) : [],
            languages: doctorForm.languages ? doctorForm.languages.split(',').map(l => l.trim()) : ['English'],
            achievements: doctorForm.achievements ? doctorForm.achievements.split(',').map(a => a.trim()) : [],
            experience: doctorForm.experience || '10+ years',
            rating: doctorForm.rating || '4.5 (50 Reviews)',
            icon: doctorForm.icon || '👨‍⚕️'
        }
        if (editingDoctor) onUpdateDoctor(doctorData)
        else onAddDoctor(doctorData)
        setShowDoctorModal(false)
        setEditingDoctor(null)
        setDoctorForm({
            name: '', specialty: '', experience: '', rating: '', location: '', clinicName: '', clinicId: '', icon: '👨‍⚕️', available: 'Today',
            qualifications: '', education: '', bio: '', languages: '', achievements: '', fee: '',
            schedule: { morning: { start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: true }, evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: true } }
        })
    }

    const handleEditDoctor = (doctor) => {
        setEditingDoctor(doctor)
        setSelectedDoctorId(null) // Reset detail view when editing
        setEditingDoctor(doctor)
        setDoctorForm({
            name: doctor.name, specialty: doctor.specialty, experience: doctor.experience, rating: doctor.rating, location: doctor.location,
            clinicName: doctor.clinicName, clinicId: doctor.clinicId?.toString() || '', icon: doctor.icon, available: doctor.available,
            qualifications: doctor.qualifications?.join(', ') || '', education: doctor.education || '', bio: doctor.bio || '',
            languages: doctor.languages?.join(', ') || '', achievements: doctor.achievements?.join(', ') || '', fee: doctor.fee || '',
            schedule: doctor.schedule || { morning: { start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: true }, evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: true } }
        })
        setShowDoctorModal(true)
    }

    const handleSaveClinic = () => {
        if (!clinicForm.name || !clinicForm.location) { alert('Please fill Name and Location'); return }
        const clinicData = {
            ...clinicForm,
            _id: editingClinic?._id || editingClinic?.id,
            specialties: clinicForm.specialties ? clinicForm.specialties.split(',').map(s => s.trim()) : [],
            facilities: clinicForm.facilities ? clinicForm.facilities.split(',').map(f => f.trim()) : [],
            reviews: parseInt(clinicForm.reviews) || 0, tokensAvailable: parseInt(clinicForm.tokensAvailable) || 10,
            rating: clinicForm.rating || '4.5', doctors: editingClinic?.doctors || []
        }
        if (editingClinic) onUpdateClinic(clinicData)
        else onAddClinic(clinicData)
        setShowClinicModal(false)
        setEditingClinic(null)
        setClinicForm({ name: '', address: '', location: '', phone: '', emergency: '', rating: '', reviews: '', icon: '🏥', timings: '', specialties: '', facilities: '', tokensAvailable: '', status: 'open', doctors: [] })
    }

    const handleEditClinic = (clinic) => {
        setEditingClinic(clinic)
        setSelectedClinicId(null) // Reset detail view when editing
        setEditingClinic(clinic)
        setClinicForm({
            name: clinic.name, address: clinic.address || '', location: clinic.location, phone: clinic.phone || '', emergency: clinic.emergency || '', rating: clinic.rating,
            reviews: clinic.reviews?.toString() || '', icon: clinic.icon, timings: clinic.timings || '',
            specialties: clinic.specialties?.join(', ') || '', facilities: clinic.facilities?.join(', ') || '',
            tokensAvailable: clinic.tokensAvailable?.toString() || '', status: clinic.status || 'open', doctors: clinic.doctors || []
        })
        setShowClinicModal(true)
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'approvals', label: 'Approvals', icon: '🔔' },
        { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
        { id: 'clinics', label: 'Clinics', icon: '🏥' },
        { id: 'appointments', label: 'Appointments', icon: '📅' },
        { id: 'walkins', label: 'Walk-ins', icon: '🚶' },
        { id: 'patients', label: 'Patients', icon: '👥' },
    ]

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <span className="admin-logo-icon">🏥</span>
                    <span className="admin-logo-text">Medicare<span>+</span></span>
                </div>
                <nav className="admin-nav">
                    {menuItems.map(item => (
                        <button key={item.id} className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} 
                            onClick={() => { 
                                setActiveTab(item.id); 
                                setSelectedDoctorId(null); 
                                setSelectedClinicId(null); 
                            }}>
                            <span className="nav-icon">{item.icon}</span> {item.label}
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <button className="admin-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-top-bar">
                    <div className="admin-search">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="add-btn" onClick={() => navigate('/find-doctor')} style={{ marginRight: '10px' }}>
                        🌐 View Site
                    </button>
                </header>

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="admin-content">
                        <h1>Platform Overview</h1>
                        
                        <div className="stats-grid">
                            <div className="stat-card" style={{ borderLeftColor: '#0066ff' }}>
                                <div className="stat-icon">👨‍⚕️</div>
                                <div className="stat-info"><span className="stat-value">{doctorStats.total}</span><span className="stat-label">Total Doctors</span></div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: '#22c55e' }}>
                                <div className="stat-icon">🏥</div>
                                <div className="stat-info"><span className="stat-value">{clinicStats.total}</span><span className="stat-label">Clinics</span></div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                                <div className="stat-icon">📅</div>
                                <div className="stat-info"><span className="stat-value">{bookingStats.today}</span><span className="stat-label">Today's Appointments</span></div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                                <div className="stat-icon">👥</div>
                                <div className="stat-info"><span className="stat-value">{patients.length}</span><span className="stat-label">Total Patients</span></div>
                            </div>
                        </div>

                        <div className="dashboard-grid" style={{ marginTop: '15px' }}>
                            <div className="dashboard-card">
                                <h3>👨‍⚕️ Doctors by Specialty</h3>
                                <div className="analytics-list">
                                    {Object.entries(doctorStats.bySpecialty).map(([spec, count]) => (
                                        <div key={spec} className="analytics-item">
                                            <span className="analytics-label">{spec}</span>
                                            <div className="analytics-bar"><div className="analytics-fill" style={{ width: `${(count / doctorStats.total) * 100}%` }}></div></div>
                                            <span className="analytics-value">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="dashboard-card">
                                <h3>🏥 Clinics by Location</h3>
                                <div className="analytics-list">
                                    {Object.entries(clinicStats.byLocation).map(([loc, count]) => (
                                        <div key={loc} className="analytics-item">
                                            <span className="analytics-label">{loc}</span>
                                            <div className="analytics-bar"><div className="analytics-fill green" style={{ width: `${(count / clinicStats.total) * 100}%` }}></div></div>
                                            <span className="analytics-value">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid" style={{ marginTop: '15px' }}>
                            <div className="dashboard-card">
                                <h3>📅 Today's Appointments</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '10px' }}>
                                    <div className="mini-stat"><span className="mini-value">{bookingStats.morning}</span><span className="mini-label">🌅 Morning</span></div>
                                    <div className="mini-stat"><span className="mini-value">{bookingStats.evening}</span><span className="mini-label">🌙 Evening</span></div>
                                    <div className="mini-stat"><span className="mini-value">{bookingStats.clinic}</span><span className="mini-label">🏥 Clinic Visit</span></div>
                                    <div className="mini-stat"><span className="mini-value">{bookingStats.online}</span><span className="mini-label">📹 Online Consult</span></div>
                                </div>
                            </div>
                            <div className="dashboard-card">
                                <h3>Recent Appointments</h3>
                                <div className="recent-list">
                                    {tokenBookings.slice(0, 5).map((booking) => {
                                        const docId = booking.doctorId?._id || booking.doctorId
                                        const doctor = doctors.find(d => (d._id === docId || d.id?.toString() === docId?.toString()))
                                        return (
                                            <div key={booking._id || booking.id || Math.random()} className="recent-item">
                                                <span className="recent-icon">📋</span>
                                                <div className="recent-info"><span className="recent-name">{booking.patientName}</span><span className="recent-detail">{doctor?.name || 'Unknown'} • {booking.session}</span></div>
                                                <span className="recent-token">#{booking.tokenNumber}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card" style={{ marginTop: '15px' }}>
                            <h3>Quick Actions</h3>
                            <div className="quick-actions" style={{ marginTop: '10px' }}>
                                <button className="action-btn" onClick={() => { setShowDoctorModal(true); setEditingDoctor(null) }}><span>➕</span> Add Doctor</button>
                                <button className="action-btn" onClick={() => { setShowClinicModal(true); setEditingClinic(null) }}><span>➕</span> Add Clinic</button>
                                <button className="action-btn secondary" onClick={() => navigate('/doctor-dashboard')}><span>⚙️</span> Doctor Panel</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* APPROVALS */}
                {activeTab === 'approvals' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Pending Approvals</h1>
                            <span className="pending-badge">{pendingDoctors.length} New Requests</span>
                        </div>

                        {pendingDoctors.length === 0 ? (
                            <div className="no-data-msg" style={{ marginTop: '2rem' }}>
                                <span style={{ fontSize: '3rem' }}>✨</span>
                                <p>No pending doctor registrations to review.</p>
                            </div>
                        ) : (
                            <div className="approvals-grid">
                                {pendingDoctors.map(doctor => (
                                    <div key={doctor._id || doctor.id} className="approval-card">
                                        <div className="approval-card-top">
                                            <div className="approval-avatar">{doctor.imageUrl ? <img src={doctor.imageUrl} alt="" /> : (doctor.icon || '👨‍⚕️')}</div>
                                            <div className="approval-info">
                                                <h3>{doctor.name}</h3>
                                                <p className="spec">{doctor.specialty}</p>
                                                <p className="clinic">🏥 {doctor.clinicName || 'South Mumbai Clinic'}</p>
                                            </div>
                                        </div>
                                        <div className="approval-details">
                                            <div className="view-row"><span>🎓 Degree:</span> <strong>{doctor.degree || doctor.qualifications?.join(', ') || 'MBBS, MD'}</strong></div>
                                            <div className="view-row"><span>🏫 College:</span> <strong>{doctor.college || 'Grant Medical College'}</strong></div>
                                            <div className="view-row"><span>📜 Reg No:</span> <strong className="reg-id">{doctor.regNo || 'MC-12345'}</strong></div>
                                            <div className="view-row"><span>📞 Phone:</span> <strong>{doctor.phone}</strong></div>
                                            <div className="view-row"><span>🏢 Location:</span> <strong>{doctor.cityState || doctor.location}</strong></div>
                                        </div>
                                        <div className="approval-actions">
                                            <button className="approve-btn" onClick={() => onUpdateDoctor({ ...doctor, status: 'approved' })}>
                                                ✅ Approve
                                            </button>
                                            <button className="reject-btn" onClick={() => { if(confirm('Are you sure you want to reject this application?')) onDeleteDoctor(doctor._id || doctor.id) }}>
                                                ❌ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* DOCTORS */}
                {activeTab === 'doctors' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Doctors Management</h1>
                            <button className="add-btn" onClick={() => { setShowDoctorModal(true); setEditingDoctor(null); setDoctorForm({
                                name: '', specialty: '', experience: '', rating: '', location: '', clinicName: '', clinicId: '', icon: '👨‍⚕️', available: 'Today',
                                qualifications: '', education: '', bio: '', languages: '', fee: '',
                                schedule: { morning: { start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: true }, evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: true } }
                            })}}>➕ Add Doctor</button>
                        </div>

                        <div className="filters-bar">
                            <select value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)}>
                                {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
                                <option value="">All Locations</option>
                                {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <span style={{ color: '#666' }}>{filteredDoctors.length} doctors</span>
                        </div>

                        {selectedDoctor ? (
                            <div className="detail-view">
                                <button className="back-btn" onClick={() => setSelectedDoctorId(null)}>← Back</button>
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className="detail-avatar">{selectedDoctor.icon}</div>
                                        <div>
                                            <h2>{selectedDoctor.name}</h2>
                                            <p>{selectedDoctor.specialty} • {selectedDoctor.experience}</p>
                                            <p>📍 {selectedDoctor.location} • 🏥 {selectedDoctor.clinicName || 'Not Assigned'}</p>
                                        </div>
                                        <div className="detail-actions">
                                            <button className="edit-btn" onClick={() => handleEditDoctor(selectedDoctor)}>✏️ Edit</button>
                                            <button className="delete-btn" onClick={() => { if(confirm('Delete?')) onDeleteDoctor(selectedDoctor._id || selectedDoctor.id) }}>🗑️</button>
                                        </div>
                                    </div>
                                    <div className="detail-stats">
                                        <div className="detail-stat"><span className="stat-label">Rating</span><span className="stat-value">⭐ {selectedDoctor.rating}</span></div>
                                        <div className="detail-stat"><span className="stat-label">Fee</span><span className="stat-value">₹{selectedDoctor.fee || '500'}</span></div>
                                        <div className="detail-stat"><span className="stat-label">Availability</span><span className="stat-value">{selectedDoctor.available}</span></div>
                                        <div className="detail-stat"><span className="stat-label">Patients</span><span className="stat-value">{tokenBookings.filter(b => {
                                          const dId = b.doctorId?._id || b.doctorId
                                          const targetId = selectedDoctor._id || selectedDoctor.id?.toString()
                                          return dId?.toString() === targetId
                                        }).length}</span></div>
                                    </div>
                                    <div className="detail-section">
                                        <h4>Schedule</h4>
                                        <div className="schedule-grid">
                                            <div className="schedule-box"><strong>🌅 Morning</strong><p>{selectedDoctor.schedule?.morning?.start || '09:00'} - {selectedDoctor.schedule?.morning?.end || '13:00'}</p><p>{selectedDoctor.schedule?.morning?.totalTokens || 20} Tokens</p></div>
                                            <div className="schedule-box"><strong>🌙 Evening</strong><p>{selectedDoctor.schedule?.evening?.start || '17:00'} - {selectedDoctor.schedule?.evening?.end || '21:00'}</p><p>{selectedDoctor.schedule?.evening?.totalTokens || 15} Tokens</p></div>
                                        </div>
                                    </div>
                                    
                                    {selectedDoctor.bio && (
                                        <div className="detail-section">
                                            <h4>About</h4>
                                            <p>{selectedDoctor.bio}</p>
                                        </div>
                                    )}

                                    <div className="detail-grid-two">
                                        {selectedDoctor.education && (
                                            <div className="detail-section">
                                                <h4>Education</h4>
                                                <p>🎓 {selectedDoctor.education}</p>
                                            </div>
                                        )}
                                        {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 && (
                                            <div className="detail-section">
                                                <h4>Qualifications</h4>
                                                <div className="tag-container">
                                                    {selectedDoctor.qualifications.map(q => <span key={q} className="info-tag">{q}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-grid-two">
                                        {selectedDoctor.languages && selectedDoctor.languages.length > 0 && (
                                            <div className="detail-section">
                                                <h4>Languages</h4>
                                                <div className="tag-container">
                                                    {selectedDoctor.languages.map(l => <span key={l} className="info-tag facility">{l}</span>)}
                                                </div>
                                            </div>
                                        )}
                                        {selectedDoctor.achievements && selectedDoctor.achievements.length > 0 && (
                                            <div className="detail-section">
                                                <h4>Achievements</h4>
                                                <div className="tag-container">
                                                    {selectedDoctor.achievements.map(a => <span key={a} className="info-tag achievement">{a}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="data-table">
                                <div className="table-header">
                                    <span>Doctor</span><span>Specialty</span><span>Location</span><span>Clinic</span><span>Schedule</span><span>Rating</span><span>Actions</span>
                                </div>
                                {filteredDoctors.map(doctor => (
                                    <div 
                                        key={doctor._id || doctor.id} 
                                        className="table-row clickable-row"
                                        onClick={() => setSelectedDoctorId(doctor._id || doctor.id)}
                                    >
                                        <div className="table-doctor">
                                            <span className="doctor-icon">{doctor.icon}</span>
                                            <div>
                                                <span className="doctor-name">{doctor.name}</span>
                                                <span className="doctor-spec">{doctor.experience}</span>
                                            </div>
                                        </div>
                                        <span>{doctor.specialty}</span>
                                        <span>{doctor.location}</span>
                                        <span>{doctor.clinicName || '-'}</span>
                                        <span>
                                            {doctor.schedule?.morning?.active && <span className="session-badge morning">🌅 {doctor.schedule.morning.start}-{doctor.schedule.morning.end}</span>}
                                            {doctor.schedule?.evening?.active && <span className="session-badge evening">🌙 {doctor.schedule.evening.start}-{doctor.schedule.evening.end}</span>}
                                        </span>
                                        <span className="rating">⭐ {doctor.rating}</span>
                                        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                            <button className="edit-btn" title="View Details" onClick={() => setSelectedDoctorId(doctor._id || doctor.id)}>👁️</button>
                                            <button className="edit-btn" title="Edit Doctor" onClick={() => handleEditDoctor(doctor)}>✏️</button>
                                            <button className="delete-btn" title="Delete Doctor" onClick={() => { if(confirm('Are you sure you want to delete this doctor?')) onDeleteDoctor(doctor._id || doctor.id) }}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CLINICS */}
                {activeTab === 'clinics' && (
                    <div className="admin-content">
                        <div className="admin-header">
                            <h1>Clinics Management</h1>
                            <button className="add-btn" onClick={() => { setShowClinicModal(true); setEditingClinic(null) }}>➕ Add Clinic</button>
                        </div>

                        {selectedClinic ? (
                            <div className="detail-view">
                                <button className="back-btn" onClick={() => setSelectedClinicId(null)}>← Back</button>
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className="detail-avatar" style={{ background: '#dcfce7' }}>{selectedClinic.icon}</div>
                                        <div>
                                            <h2>{selectedClinic.name}</h2>
                                            <p>📍 {selectedClinic.location}</p>
                                            <p>📞 {selectedClinic.phone}</p>
                                            {selectedClinic.emergency && <p style={{ color: '#ef4444' }}>🚑 Emergency: {selectedClinic.emergency}</p>}
                                        </div>
                                        <div className="detail-actions">
                                            <button className="edit-btn" onClick={() => navigate(`/clinic-admin/${selectedClinic._id || selectedClinic.id}`)}>⚙️ Manage</button>
                                            <button className="edit-btn" onClick={() => handleEditClinic(selectedClinic)}>✏️ Edit</button>
                                            <button className="delete-btn" onClick={() => { if(confirm('Delete?')) onDeleteClinic(selectedClinic._id || selectedClinic.id) }}>🗑️</button>
                                        </div>
                                    </div>
                                    <div className="detail-stats">
                                        <div className="detail-stat"><span className="stat-label">Rating</span><span className="stat-value">⭐ {selectedClinic.rating}</span></div>
                                        <div className="detail-stat"><span className="stat-label">Reviews</span><span className="stat-value">{selectedClinic.reviews}</span></div>
                                        <div className="detail-stat"><span className="stat-label">Doctors</span><span className="stat-value">{selectedClinic.doctors?.length || 0}</span></div>
                                        <div className="detail-stat"><span className="stat-label">Status</span><span className="stat-value">{selectedClinic.status}</span></div>
                                    </div>
                                    <div className="detail-section"><h4>Timings</h4><p>{selectedClinic.timings || 'Not set'}</p></div>
                                    <div className="detail-section"><h4>Address</h4><p>{selectedClinic.address || 'Not set'}</p></div>
                                    <div className="detail-section">
                                        <h4>Specialties</h4>
                                        <div className="tag-container">{selectedClinic.specialties?.map(s => <span key={s} className="info-tag">{s}</span>)}</div>
                                    </div>
                                    <div className="detail-section">
                                        <h4>Facilities</h4>
                                        <div className="tag-container">{selectedClinic.facilities?.map(f => <span key={f} className="info-tag facility">{f}</span>)}</div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Doctors in this Clinic</h4>
                                        <div className="clinic-doctors-grid">
                                            {doctors.filter(d => (d.clinicId === selectedClinic._id || d.clinicId === selectedClinic.id || d.clinicName === selectedClinic.name)).map(doc => (
                                                <div key={doc._id || doc.id} className="mini-doctor-card" onClick={() => { setSelectedDoctorId(doc._id || doc.id); setActiveTab('doctors'); }}>
                                                    <div className="mini-doctor-icon">{doc.icon}</div>
                                                    <div className="mini-doctor-info">
                                                        <span className="mini-doctor-name">{doc.name}</span>
                                                        <span className="mini-doctor-spec">{doc.specialty}</span>
                                                    </div>
                                                    <span className="mini-doctor-rating">⭐ {doc.rating.split(' ')[0]}</span>
                                                </div>
                                            ))}
                                            {doctors.filter(d => (d.clinicId === selectedClinic._id || d.clinicId === selectedClinic.id || d.clinicName === selectedClinic.name)).length === 0 && (
                                                <p className="no-data-msg">No doctors assigned to this clinic yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="data-table">
                                <div className="table-header">
                                    <span>Clinic</span><span>Location</span><span>Phone</span><span>Doctors</span><span>Rating</span><span>Status</span><span>Actions</span>
                                </div>
                                {filteredClinics.map(clinic => (
                                    <div 
                                        key={clinic._id || clinic.id} 
                                        className="table-row clickable-row"
                                        onClick={() => setSelectedClinicId(clinic._id || clinic.id)}
                                    >
                                        <div className="table-doctor"><span className="doctor-icon">{clinic.icon}</span><span className="doctor-name">{clinic.name}</span></div>
                                        <span>{clinic.location}</span>
                                        <span>{clinic.phone}</span>
                                        <span>{clinic.doctors?.length || 0}</span>
                                        <span className="rating">⭐ {clinic.rating}</span>
                                        <span className={`status-badge ${clinic.status === 'open' ? 'active' : 'inactive'}`}>{clinic.status}</span>
                                        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                            <button className="edit-btn" title="View Details" onClick={() => setSelectedClinicId(clinic._id || clinic.id)}>👁️</button>
                                            <button className="edit-btn" title="Manage Clinic" onClick={() => navigate(`/clinic-admin/${clinic._id || clinic.id}`)}>⚙️</button>
                                            <button className="edit-btn" title="Edit Clinic" onClick={() => handleEditClinic(clinic)}>✏️</button>
                                            <button className="delete-btn" title="Delete Clinic" onClick={() => { if(confirm('Are you sure you want to delete this clinic?')) onDeleteClinic(clinic._id || clinic.id) }}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* APPOINTMENTS */}
                {activeTab === 'appointments' && (
                    <div className="admin-content">
                        <div className="admin-header-row">
                            <h1>Appointments</h1>
                            <div className="filter-bar">
                                <div className="search-box-mini">
                                    <span>🔍</span>
                                    <input type="text" placeholder="Search patient or ID..." value={appSearchQuery} onChange={e => setAppSearchQuery(e.target.value)} />
                                </div>
                                <div className="search-box-mini">
                                    <span>📅</span>
                                    <input type="date" value={appDateFilter} onChange={e => setAppDateFilter(e.target.value)} />
                                </div>
                                { (appSearchQuery || appDateFilter) && <button className="btn-reset-mini" onClick={() => { setAppSearchQuery(''); setAppDateFilter(''); }}>Reset</button> }
                            </div>
                        </div>
                        <div className="data-table appointments-table">
                            <div className="table-header">
                                <span>Token</span><span>Patient</span><span>Doctor</span><span>Clinic</span><span>Session</span><span>Date</span><span>Status</span><span>Actions</span>
                            </div>
                            {filteredAppointments.map((booking) => {
                                const docId = booking.doctorId?._id || booking.doctorId
                                const doctor = doctors.find(d => (d._id === docId || d.id?.toString() === docId?.toString()))
                                return (
                                    <div key={booking._id || booking.id || Math.random()} className="table-row">
                                        <span className="token-id">#{booking.tokenNumber}</span>
                                        <div className="table-doctor">
                                            <span>{booking.patientName}</span>
                                            <span className="doctor-spec">{booking.patientPhone}</span>
                                        </div>
                                        <span>{doctor?.name || 'Unknown'}</span>
                                        <span>{doctor?.clinicName || 'N/A'}</span>
                                        <span className={`session-badge ${booking.session}`}>{booking.session === 'morning' ? '🌅 AM' : '🌙 PM'}</span>
                                        <span>{(booking.bookingDate ? new Date(booking.bookingDate) : getBookingDate(booking)).toLocaleDateString()}</span>
                                        <span className={`status-pill ${booking.status || 'pending'}`}>{booking.status || 'pending'}</span>
                                        <div className="action-buttons">
                                            {booking.status === 'pending' && <button className="edit-btn" title="Mark Serving" onClick={() => onUpdateBookingStatus(booking._id || booking.id, 'serving')}>▶️</button>}
                                            {booking.status === 'serving' && <button className="edit-btn" title="Mark Completed" onClick={() => onUpdateBookingStatus(booking._id || booking.id, 'completed')}>✅</button>}
                                            {(booking.status === 'pending' || booking.status === 'serving') && <button className="delete-btn" title="Cancel Booking" onClick={() => { if(confirm('Cancel appointment?')) onUpdateBookingStatus(booking._id || booking.id, 'cancelled') }}>✕</button>}
                                        </div>
                                    </div>
                                )
                            })}
                            {filteredAppointments.length === 0 && <div className="table-row"><span style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>No appointments found matching filters</span></div>}
                        </div>
                    </div>
                )}

                {/* PATIENTS */}
                {activeTab === 'patients' && (
                    <div className="admin-content">
                        <h1>Patients</h1>
                        <div className="data-table">
                            <div className="table-header">
                                <span>Patient</span><span>Phone</span><span>Total Visits</span><span>Last Visit</span><span>Last Doctor</span>
                            </div>
                            {(patients || []).map((patient) => (
                                <div key={patient.phone || patient.name || Math.random()} className="table-row">
                                    <span style={{ fontWeight: 600 }}>{patient.name}</span>
                                    <span>{patient.phone || 'N/A'}</span>
                                    <span>{patient.visits}</span>
                                    <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                                    <span>{patient.lastDoctor || 'N/A'}</span>
                                </div>
                            ))}
                            {(patients || []).length === 0 && <div className="table-row"><span style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>No patients found in history</span></div>}
                        </div>
                    </div>
                )}

                {/* WALK-INS */}
                {activeTab === 'walkins' && (
                    <WalkInAnalytics 
                        tokenBookings={tokenBookings} 
                        doctors={doctors} 
                        clinics={clinics} 
                    />
                )}
            </main>

            {/* MODALS */}
            {showDoctorModal && (
                <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                            <button className="modal-close" onClick={() => setShowDoctorModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Full Name *</label><input type="text" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} placeholder="Dr. Name" /></div>
                                <div className="form-group"><label>Specialty *</label><input type="text" value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} placeholder="Cardiologist" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Experience</label><input type="text" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} placeholder="10+ years" /></div>
                                <div className="form-group"><label>Location *</label><input type="text" value={doctorForm.location} onChange={e => setDoctorForm({...doctorForm, location: e.target.value})} placeholder="South Mumbai" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Clinic</label><select value={doctorForm.clinicId} onChange={e => { const c = clinics.find(x => (x._id === e.target.value || x.id === parseInt(e.target.value))); setDoctorForm({...doctorForm, clinicId: e.target.value, clinicName: c?.name || ''}) }}><option value="">Select Clinic</option>{clinics.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}</select></div>
                                <div className="form-group"><label>Fee (₹)</label><input type="number" value={doctorForm.fee} onChange={e => setDoctorForm({...doctorForm, fee: e.target.value})} placeholder="500" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Rating</label><input type="text" value={doctorForm.rating} onChange={e => setDoctorForm({...doctorForm, rating: e.target.value})} placeholder="4.5 (50 Reviews)" /></div>
                                <div className="form-group"><label>Availability</label><select value={doctorForm.available} onChange={e => setDoctorForm({...doctorForm, available: e.target.value})}><option>Today</option><option>Tomorrow</option><option>Not Available</option></select></div>
                            </div>
                            <div className="form-section-title">Schedule</div>
                            <div className="form-row">
                                <div className="form-group"><label>Morning</label><input type="time" value={doctorForm.schedule?.morning?.start || '09:00'} onChange={e => setDoctorForm({...doctorForm, schedule: {...doctorForm.schedule, morning: {...doctorForm.schedule?.morning, start: e.target.value}}})} /> - <input type="time" value={doctorForm.schedule?.morning?.end || '13:00'} onChange={e => setDoctorForm({...doctorForm, schedule: {...doctorForm.schedule, morning: {...doctorForm.schedule?.morning, end: e.target.value}}})} /></div>
                                <div className="form-group"><label>Tokens</label><input type="number" value={doctorForm.schedule?.morning?.totalTokens || 20} onChange={e => setDoctorForm({...doctorForm, schedule: {...doctorForm.schedule, morning: {...doctorForm.schedule?.morning, totalTokens: parseInt(e.target.value)}}})} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Evening</label><input type="time" value={doctorForm.schedule?.evening?.start || '17:00'} onChange={e => setDoctorForm({...doctorForm, schedule: {...doctorForm.schedule, evening: {...doctorForm.schedule?.evening, start: e.target.value}}})} /> - <input type="time" value={doctorForm.schedule?.evening?.end || '21:00'} onChange={e => setDoctorForm({...doctorForm, schedule: {...doctorForm.schedule, evening: {...doctorForm.schedule?.evening, end: e.target.value}}})} /></div>
                                <div className="form-group"><label>Tokens</label><input type="number" value={doctorForm.schedule?.evening?.totalTokens || 15} onChange={e => setDoctorForm({...doctorForm, schedule: {...doctorForm.schedule, evening: {...doctorForm.schedule?.evening, totalTokens: parseInt(e.target.value)}}})} /></div>
                            </div>

                            <div className="form-section-title">Additional Info</div>
                            <div className="form-group"><label>Bio / About</label><textarea value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})} placeholder="Detailed doctor profile..." rows={3}></textarea></div>
                            <div className="form-row">
                                <div className="form-group"><label>Education</label><input type="text" value={doctorForm.education} onChange={e => setDoctorForm({...doctorForm, education: e.target.value})} placeholder="Grant Medical College, Mumbai" /></div>
                            </div>
                            <div className="form-group"><label>Qualifications (comma separated)</label><input type="text" value={doctorForm.qualifications} onChange={e => setDoctorForm({...doctorForm, qualifications: e.target.value})} placeholder="MBBS, MD, DM" /></div>
                            <div className="form-group"><label>Languages (comma separated)</label><input type="text" value={doctorForm.languages} onChange={e => setDoctorForm({...doctorForm, languages: e.target.value})} placeholder="English, Hindi, Marathi" /></div>
                            <div className="form-group"><label>Achievements (comma separated)</label><input type="text" value={doctorForm.achievements} onChange={e => setDoctorForm({...doctorForm, achievements: e.target.value})} placeholder="Best Doctor Award, 1000+ Surgeries" /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveDoctor}>{editingDoctor ? 'Update' : 'Add'} Doctor</button>
                        </div>
                    </div>
                </div>
            )}

            {showClinicModal && (
                <div className="modal-overlay" onClick={() => setShowClinicModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingClinic ? 'Edit Clinic' : 'Add New Clinic'}</h2>
                            <button className="modal-close" onClick={() => setShowClinicModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Clinic Name *</label><input type="text" value={clinicForm.name} onChange={e => setClinicForm({...clinicForm, name: e.target.value})} placeholder="Apollo Clinic" /></div>
                                <div className="form-group"><label>Location *</label><input type="text" value={clinicForm.location} onChange={e => setClinicForm({...clinicForm, location: e.target.value})} placeholder="South Mumbai" /></div>
                            </div>
                            <div className="form-group"><label>Address</label><textarea value={clinicForm.address} onChange={e => setClinicForm({...clinicForm, address: e.target.value})} placeholder="Full Address" rows={2}></textarea></div>
                            <div className="form-row">
                                <div className="form-group"><label>Phone</label><input type="text" value={clinicForm.phone} onChange={e => setClinicForm({...clinicForm, phone: e.target.value})} placeholder="+91 22 1234 5678" /></div>
                                <div className="form-group"><label>Emergency Contact</label><input type="text" value={clinicForm.emergency} onChange={e => setClinicForm({...clinicForm, emergency: e.target.value})} placeholder="+91 22 9876 5432" /></div>
                            </div>
                            <div className="form-group"><label>Timings</label><input type="text" value={clinicForm.timings} onChange={e => setClinicForm({...clinicForm, timings: e.target.value})} placeholder="Mon-Sat: 9AM-9PM" /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Rating</label><input type="text" value={clinicForm.rating} onChange={e => setClinicForm({...clinicForm, rating: e.target.value})} placeholder="4.5" /></div>
                                <div className="form-group"><label>Tokens</label><input type="number" value={clinicForm.tokensAvailable} onChange={e => setClinicForm({...clinicForm, tokensAvailable: e.target.value})} placeholder="10" /></div>
                            </div>
                            <div className="form-group"><label>Specialties (comma)</label><input type="text" value={clinicForm.specialties} onChange={e => setClinicForm({...clinicForm, specialties: e.target.value})} placeholder="Cardiology, General Medicine" /></div>
                            <div className="form-group"><label>Facilities (comma)</label><input type="text" value={clinicForm.facilities} onChange={e => setClinicForm({...clinicForm, facilities: e.target.value})} placeholder="OPD, Lab, Pharmacy" /></div>
                            <div className="form-group"><label>Status</label><select value={clinicForm.status} onChange={e => setClinicForm({...clinicForm, status: e.target.value})}><option value="open">Open</option><option value="closed">Closed</option></select></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowClinicModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveClinic}>{editingClinic ? 'Update' : 'Add'} Clinic</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard

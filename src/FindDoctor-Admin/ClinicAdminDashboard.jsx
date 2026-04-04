import { useState, useMemo, Suspense, lazy, memo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ClinicAdminDashboard.css'

// Lazy load modular components
const DashboardStats = lazy(() => import('./components/DashboardStats'))
const QueueManager = lazy(() => import('./components/QueueManager'))
const DoctorManager = lazy(() => import('./components/DoctorManager'))
const AppointmentView = lazy(() => import('./components/AppointmentView'))
const DoctorScheduleManager = lazy(() => import('./components/DoctorScheduleManager'))
const ClinicAnalytics = lazy(() => import('./components/ClinicAnalytics'))
const PatientRecords = lazy(() => import('./components/PatientRecords'))
const SpecialHours = lazy(() => import('./components/SpecialHours'))
const WalkInPatient = lazy(() => import('./components/WalkInPatient'))
const Earnings = lazy(() => import('./components/Earnings'))
const Reviews = lazy(() => import('./components/Reviews'))
const Prescription = lazy(() => import('./components/Prescription'))

// ─── Wrapped in memo to prevent re-mount from parent polling ───────────────
const ClinicAdminDashboard = memo(function ClinicAdminDashboard({ 
    clinic, doctors, tokenBookings, tokenStates, 
    onUpdateClinic, onUpdateTokenState, onUpdateDoctor, onUpdateSchedule, onBookToken, onAddDoctor, onUpdateBookingStatus 
}) {
    const navigate = useNavigate()

    // ── Navigation State (sessionStorage persist) ──
    const [activeTab, setActiveTabState] = useState(
        () => sessionStorage.getItem(`tab-${clinic?._id || clinic?.id}`) || 'dashboard'
    )

    const setActiveTab = useCallback((tab) => {
        setActiveTabState(tab)
        sessionStorage.setItem(`tab-${clinic?._id || clinic?.id}`, tab)
    }, [clinic])

    // ── Search & Filter State ──
    const [selectedDoctorId, setSelectedDoctorId] = useState(null)
    const [activeSession, setActiveSession] = useState('morning')

    // ── Online/Offline Mode State ──
    const [isOnlineMode, setIsOnlineMode] = useState(() => {
        const saved = localStorage.getItem(`clinic-mode-${clinic?._id || clinic?.id}`)
        return saved ? saved === 'online' : true
    })

    const toggleMode = useCallback(() => {
        setIsOnlineMode(prev => {
            const next = !prev
            localStorage.setItem(`clinic-mode-${clinic?._id || clinic?.id}`, next ? 'online' : 'offline')
            return next
        })
    }, [clinic])

    // ── Modal & Form States ──
    const [walkInForm, setWalkInForm] = useState({ 
        patientName: '', patientPhone: '', visitType: 'clinic', session: 'morning',
        bookingDate: new Date().toISOString().split('T')[0]
    })
    const [showWalkInModal, setShowWalkInModal] = useState(false)

    // ── Guard ──
    if (!clinic) return (
        <div className="error-fallback">
            <h2>Clinic data not found</h2>
            <button onClick={() => navigate('/clinic-portals')}>Return to Portal</button>
        </div>
    )

    // ── Edit Profile Form State ──
    const [editForm, setEditForm] = useState({
        name: clinic?.name || '',
        address: clinic?.address || '',
        phone: clinic?.phone || '',
        timings: clinic?.timings || '',
        location: clinic?.location || '',
        specialties: clinic?.specialties?.join(', ') || '',
        facilities: clinic?.facilities?.join(', ') || '',
        themeColor: clinic?.themeColor || '#6366f1'
    })

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSaveProfile = () => {
        const updatedClinic = {
            ...clinic,
            name: editForm.name,
            address: editForm.address,
            phone: editForm.phone,
            timings: editForm.timings,
            location: editForm.location,
            specialties: editForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
            facilities: editForm.facilities.split(',').map(f => f.trim()).filter(Boolean),
            themeColor: editForm.themeColor
        }
        onUpdateClinic(updatedClinic)
        alert('Clinic profile updated successfully!')
    }

    // ── Data Memoization ──
    const allClinicDoctors = useMemo(() => {
        const set1 = doctors.filter(d => d.clinicName === clinic.name)
        const set2 = clinic.doctors?.map((doc, idx) => {
            const existing = doctors.find(d => d.name === doc.name)
            return existing || {
                id: `${clinic?._id || clinic?.id}-${idx}`,
                name: doc.name, specialty: doc.specialty, icon: doc.icon || '👨‍⚕️',
                experience: '10+ Years',
                schedule: {
                    morning: { active: doc.morning !== 'Not Available', start: '09:00', end: '13:00' },
                    evening: { active: doc.evening !== 'Not Available', start: '17:00', end: '21:00' }
                }
            }
        }) || []
        const merged = [...set1]
        set2.forEach(d2 => {
            if (!merged.some(m => m.name === d2.name)) merged.push(d2)
        })
        return merged
    }, [clinic, doctors])

    const selectedDoctor = useMemo(() => {
        return allClinicDoctors.find(d => (d._id === selectedDoctorId || d.id?.toString() === selectedDoctorId?.toString())) || allClinicDoctors[0]
    }, [allClinicDoctors, selectedDoctorId])

  // ── Refresh Key for forcing re-render ──
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  // ── Prescription Refresh ──
  const [prescriptionRefreshKey, setPrescriptionRefreshKey] = useState(0);
  const handlePrescriptionSaved = () => setPrescriptionRefreshKey(k => k + 1);

    const clinicBookings = useMemo(() => {
        const docsIds = allClinicDoctors.map(d => (d._id || d.id)?.toString())
        return tokenBookings.filter(b => docsIds.includes((b.doctorId?._id || b.doctorId)?.toString()))
    }, [tokenBookings, allClinicDoctors, refreshKey])

    const todayBookings = useMemo(() => {
        const todayStr = new Date().toDateString()
        return clinicBookings.filter(b => {
             const d = b.bookingDate ? new Date(b.bookingDate) : new Date()
             return d.toDateString() === todayStr
        })
    }, [clinicBookings])

    // ── Handlers ──
    const handleCallNext = useCallback(() => {
        if (!selectedDoctor) return
        const docId = selectedDoctor._id || selectedDoctor.id?.toString()
        const state = tokenStates[docId] || { currentToken: 1, status: 'open' }
        const sessionBookings = todayBookings.filter(b => (b.doctorId?._id || b.doctorId)?.toString() === docId && b.session === activeSession)
        
        // Mark current patient as completed before moving to next
        const currentBooking = sessionBookings.find(b => b.tokenNumber === state.currentToken)
        if (currentBooking) {
            const bookingId = currentBooking._id || currentBooking.id || currentBooking.tokenId
            if (bookingId && onUpdateBookingStatus) {
                onUpdateBookingStatus(bookingId, 'completed')
            }
        }
        
        if (state.currentToken < sessionBookings.length) {
            onUpdateTokenState(docId, { ...state, currentToken: state.currentToken + 1 })
        }
    }, [selectedDoctor, tokenStates, todayBookings, activeSession, onUpdateTokenState, onUpdateBookingStatus])

    const statsData = [
        { label: 'Doctors', value: allClinicDoctors.length, icon: '👨‍⚕️', color: clinic.themeColor || '#6366f1' },
        { label: 'Today', value: todayBookings.length, icon: '📅', color: '#8b5cf6' },
        { label: 'Total', value: clinicBookings.length, icon: '📋', color: '#f59e0b' },
        { label: 'Rating', value: clinic.rating || '4.8', icon: '⭐', color: '#22c55e' },
    ]

    const NAV_TABS = [
        { id: 'dashboard', label: 'Overview', icon: '📊' },
        { id: 'queue',     label: 'Live Queue', icon: '🎫' },
        { id: 'doctors',   label: 'Specialists', icon: '👨‍⚕️' },
        { id: 'schedule',  label: 'Schedules', icon: '📅' },
        { id: 'appointments', label: 'Bookings', icon: '📋' },
        { id: 'walkin',    label: 'Walk-in', icon: '🚶' },
        { id: 'patients',  label: 'Patients', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'earnings',  label: 'Earnings', icon: '💰' },
        { id: 'reviews',   label: 'Reviews', icon: '⭐' },
        { id: 'prescription', label: 'Prescription', icon: '💊' },
        { id: 'special',   label: 'Special Days', icon: '🎉' },
        { id: 'settings',  label: 'Setup', icon: '⚙️' }
    ]

    return (
        <div className="clinic-admin-dashboard" style={{ '--clinic-theme': clinic.themeColor }}>
            
            {/* ── SIDEBAR ── */}
            <aside className="clinic-sidebar">
                <div className="clinic-logo">
                    <span className="clinic-logo-icon">{clinic.icon || '🏥'}</span>
                    <span className="clinic-logo-text">{clinic.name}</span>
                </div>
                
                <nav className="clinic-nav">
                    {NAV_TABS.map(tab => (
                        <button 
                            key={tab.id}
                            className={`clinic-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            title={tab.label}
                        >
                            <span className="nav-icon-wrapper">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button 
                        className={`mode-toggle-btn ${isOnlineMode ? 'online' : 'offline'}`} 
                        onClick={toggleMode} 
                        title={isOnlineMode ? 'Switch to Offline Mode' : 'Switch to Online Mode'}
                    >
                        <span className="mode-icon">{isOnlineMode ? '🌐' : '💾'}</span>
                        <span className="mode-text">{isOnlineMode ? 'Online' : 'Offline'}</span>
                        <span className="mode-indicator"></span>
                    </button>
                    <button className="clinic-back-btn" onClick={() => navigate('/clinic-portals')} title="Exit Admin">
                        <span className="exit-icon">🚪</span>
                        <span className="exit-text">Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="clinic-main">
                <div className="clinic-content-shell">
                    <header className="content-header-premium">
                        <div className="header-left">
                            <p>Admin Control Panel</p>
                            <h1>{NAV_TABS.find(t => t.id === activeTab)?.label || 'Dashboard'}</h1>
                        </div>
                        <div className="header-right">
                            <div className={`mode-status-badge ${isOnlineMode ? 'online' : 'offline'}`}>
                                <span className="mode-dot"></span>
                                <span>{isOnlineMode ? '🌐 Online Mode' : '💾 Offline Mode'}</span>
                            </div>
                            {activeTab === 'queue' && (
                                <select 
                                    className="doctor-quick-select"
                                    value={selectedDoctorId || ''}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                >
                                    {allClinicDoctors.map(d => (
                                        <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                                    ))}
                                </select>
                            )}
                            <div className="live-clock" suppressHydrationWarning>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </header>

                    <Suspense fallback={<div className="loading-state">✨ Loading...</div>}>
                        {activeTab === 'dashboard' && (
                            <div className="tab-fade-in">
                                <DashboardStats stats={statsData} />
                                <div className="dashboard-featured-grid">
                                    <div className="featured-left">
                                        <AppointmentView 
                                            bookings={todayBookings.slice(0, 5)} 
                                            doctors={allClinicDoctors} 
                                        />
                                    </div>
                                    <div className="featured-right">
                                        <div className="clinic-info-glass-card">
                                            <h3>Clinic Profile</h3>
                                            <div className="info-item"><span>📍</span>{clinic.address}</div>
                                            <div className="info-item"><span>📞</span>{clinic.phone}</div>
                                            <div className="info-item"><span>⏰</span>{clinic.timings}</div>
                                            <div className="info-item"><span>📍</span>{clinic.location}</div>
                                            <button className="btn-edit-profile" onClick={() => setActiveTab('settings')}>
                                                ⚙️ Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'queue' && (
                            <div className="tab-fade-in">
                                <QueueManager 
                                    selectedDoctor={selectedDoctor}
                                    activeSession={activeSession}
                                    onSessionChange={setActiveSession}
                                    state={tokenStates[selectedDoctor?._id || selectedDoctor?.id?.toString()] || { currentToken: 1, status: 'open' }}
                                    sessionBookings={todayBookings.filter(b => (b.doctorId?._id || b.doctorId)?.toString() === (selectedDoctor?._id || selectedDoctor?.id?.toString()) && b.session === activeSession)}
                                    onCallNext={handleCallNext}
                                    onTogglePause={() => {}}
                                    onCloseOPD={() => {}}
                                    onWalkIn={() => setShowWalkInModal(true)}
                                    clinic={clinic}
                                    onPrescriptionSaved={handlePrescriptionSaved}
                                />
                            </div>
                        )}

                        {activeTab === 'doctors' && (
                            <div className="tab-fade-in">
                                <DoctorManager 
                                    doctors={allClinicDoctors}
                                    clinic={clinic}
                                    onAddDoctor={onAddDoctor}
                                    onEditPanel={(id) => { setSelectedDoctorId(id); setActiveTab('queue') }}
                                />
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <div className="tab-fade-in">
                                <DoctorScheduleManager 
                                    doctors={allClinicDoctors}
                                    onUpdateDoctor={onUpdateDoctor}
                                    selectedDoctorId={selectedDoctorId}
                                    onSelectDoctor={(id) => setSelectedDoctorId(id)}
                                />
                            </div>
                        )}

                        {activeTab === 'appointments' && (
                            <div className="tab-fade-in">
                                <AppointmentView 
                                    bookings={clinicBookings} 
                                    doctors={allClinicDoctors} 
                                    onUpdateBookingStatus={onUpdateBookingStatus} 
                                    onStatusChange={handleRefresh}
                                />
                            </div>
                        )}

                        {activeTab === 'walkin' && (
                            <div className="tab-fade-in">
                                <WalkInPatient 
                                    doctors={allClinicDoctors} 
                                    onBookToken={onBookToken}
                                    clinic={clinic}
                                    tokenBookings={tokenBookings}
                                />
                            </div>
                        )}

                        {activeTab === 'patients' && (
                            <div className="tab-fade-in">
                                <PatientRecords 
                                    doctors={allClinicDoctors} 
                                    tokenBookings={tokenBookings}
                                />
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="tab-fade-in">
                                <ClinicAnalytics 
                                    clinic={clinic}
                                    doctors={allClinicDoctors}
                                    bookings={clinicBookings}
                                    tokenBookings={tokenBookings}
                                />
                            </div>
                        )}

                        {activeTab === 'earnings' && (
                            <div className="tab-fade-in">
                                <Earnings 
                                    doctors={allClinicDoctors}
                                    tokenBookings={tokenBookings}
                                    clinic={clinic}
                                />
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="tab-fade-in">
                                <Reviews 
                                    doctors={allClinicDoctors}
                                    tokenBookings={tokenBookings}
                                />
                            </div>
                        )}

                        {activeTab === 'prescription' && (
                            <div className="tab-fade-in">
                                <Prescription 
                                    doctors={allClinicDoctors}
                                    tokenBookings={tokenBookings}
                                    clinic={clinic}
                                    refreshKey={prescriptionRefreshKey}
                                />
                            </div>
                        )}

                        {activeTab === 'special' && (
                            <div className="tab-fade-in">
                                <SpecialHours 
                                    clinic={clinic}
                                    onUpdateClinic={onUpdateClinic}
                                />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="tab-fade-in settings-view-glass">
                                <div className="form-sections">
                                    <div className="form-card-premium">
                                        <h3>Clinic Profile</h3>
                                        <p>Manage your clinic details, location, and services.</p>
                                        <div className="clinic-profile-form">
                                            <div className="form-row-grid">
                                                <div className="form-group">
                                                    <label>Clinic Name</label>
                                                    <input type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone Number</label>
                                                    <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Address</label>
                                                <input type="text" name="address" value={editForm.address} onChange={handleEditChange} />
                                            </div>
                                            <div className="form-row-grid">
                                                <div className="form-group">
                                                    <label>Location (City)</label>
                                                    <input type="text" name="location" value={editForm.location} onChange={handleEditChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Timings</label>
                                                    <input type="text" name="timings" value={editForm.timings} onChange={handleEditChange} placeholder="e.g., 9 AM - 9 PM" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Specialties (comma separated)</label>
                                                <input type="text" name="specialties" value={editForm.specialties} onChange={handleEditChange} placeholder="Cardiology, Neurology, Orthopedics" />
                                            </div>
                                            <div className="form-group">
                                                <label>Facilities (comma separated)</label>
                                                <input type="text" name="facilities" value={editForm.facilities} onChange={handleEditChange} placeholder="Parking, Pharmacy, Lab, Wheelchair" />
                                            </div>
                                            <div className="form-group">
                                                <label>Theme Color</label>
                                                <div className="color-picker-row">
                                                    <input type="color" name="themeColor" value={editForm.themeColor} onChange={handleEditChange} />
                                                    <span>{editForm.themeColor}</span>
                                                </div>
                                            </div>
                                            <button className="btn-primary-action" onClick={handleSaveProfile} style={{width:'auto',padding:'12px 24px'}}>
                                                Save Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>

            {/* ── MODALS ── */}
            {showWalkInModal && (
                <div className="modal-overlay-premium" onClick={() => setShowWalkInModal(false)}>
                    <div className="modal-glass" onClick={e => e.stopPropagation()}>
                        <h2>Register Walk-in Patient</h2>
                        <div className="modal-p-form">
                            <input 
                                placeholder="Patient Name" 
                                value={walkInForm.patientName}
                                onChange={e => setWalkInForm({...walkInForm, patientName: e.target.value})}
                            />
                            <input 
                                placeholder="Phone Number" 
                                value={walkInForm.patientPhone}
                                onChange={e => setWalkInForm({...walkInForm, patientPhone: e.target.value})}
                            />
                            <select value={walkInForm.session} onChange={e => setWalkInForm({...walkInForm, session: e.target.value})}>
                                <option value="morning">🌅 Morning</option>
                                <option value="evening">🌙 Evening</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowWalkInModal(false)}>Cancel</button>
                            <button className="confirm">Issue Token</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
})

export default ClinicAdminDashboard
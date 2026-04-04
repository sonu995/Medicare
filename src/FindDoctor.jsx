import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './FindDoctor.css'
import * as doctorsApi from './api/doctorsApi'

function FindDoctor({
    searchQuery, setSearchQuery,
    location, setLocation,
    handleNearMe, isLocating,
    isSearching, handleSearchChange,
    handleOpenBooking, SkeletonCard,
    doctors,
    clinics = [],
    tokenBookings = [],
    tokenStates = {}
}) {
    const [selectedSpecialty, setSelectedSpecialty] = useState('All')
    const [minRating, setMinRating] = useState(0)
    const [onlyAvailableToday, setOnlyAvailableToday] = useState(false)
    const [activeTab, setActiveTab] = useState('doctors')
    const [availableSpecialties, setAvailableSpecialties] = useState(['All'])
    const [fetchedDoctors, setFetchedDoctors] = useState([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const loadSpecs = async () => {
            try {
                const res = await doctorsApi.fetchSpecialties()
                if (res.success) {
                    // Ensure "All" is always the first option
                    const specs = res.data.filter(s => s !== 'All')
                    setAvailableSpecialties(['All', ...specs])
                }
            } catch (err) { console.error('Failed to load specialties:', err) }
        }
        loadSpecs()
    }, [])

    useEffect(() => {
        const timer = setTimeout(async () => {
            setIsLoadingResults(true)
            try {
                const params = {
                    q: searchQuery,
                    location: location,
                    specialty: selectedSpecialty !== 'All' ? selectedSpecialty : undefined,
                    rating: minRating > 0 ? minRating : undefined,
                    available: onlyAvailableToday ? 'Today' : undefined
                }
                const res = await doctorsApi.fetchDoctors(params)
                if (res.success) {
                    const clinicDoctorNames = (clinics || []).flatMap(c => c.doctors || []).map(d => d.name)
                    const filteredByClinic = res.data.filter(doc => 
                        doc.status !== 'pending' &&
                        (clinicDoctorNames.includes(doc.name) || 
                        (clinics || []).some(c => c.name === doc.clinicName))
                    )
                    setFetchedDoctors(filteredByClinic)
                }
            } catch (err) {
                console.error('Search failed:', err)
            } finally {
                setIsLoadingResults(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery, location, selectedSpecialty, minRating, onlyAvailableToday])

    const filteredClinics = (clinics || []).filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            clinic.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesLocation = !location || clinic.location.toLowerCase().includes(location.toLowerCase())
        return matchesSearch && matchesLocation
    })

    const clearFilters = () => {
        setSearchQuery('')
        setLocation('')
        setSelectedSpecialty('All')
        setMinRating(0)
        setOnlyAvailableToday(false)
    }

    const getSpecialtyIcon = (specialty) => {
        const icons = {
            'General Physician': '👨‍⚕️',
            'Dentist': '🦷',
            'Dermatologist': '🧴',
            'Cardiologist': '❤️',
            'Pediatrician': '👶',
            'Orthopedic': '🦴',
            'Gynecologist': '👩‍⚕️',
            'Eye Doctor': '👁️',
            'ENT': '👂',
            'Psychiatrist': '🧠',
            'Neurologist': '⚡',
            'Urologist': '🔬'
        }
        return icons[specialty] || '🏥'
    }

    return (
        <div className="find-doctor-page-modern">
            <section className="fd-hero">
                <div className="fd-hero-bg">
                    <div className="fd-hero-shape fd-hero-shape-1"></div>
                    <div className="fd-hero-shape fd-hero-shape-2"></div>
                    <div className="fd-hero-shape fd-hero-shape-3"></div>
                </div>
                <div className="fd-container">
                    <div className="fd-hero-content">
                        <div className="fd-hero-badge">
                            <span className="fd-badge-icon">🏥</span>
                            <span>Verified Healthcare Platform</span>
                        </div>
                        <h1>Find Expert <span className="fd-highlight">Doctors</span><br />Near You</h1>
                        <p>Book instant appointments with Mumbai's most trusted healthcare professionals</p>
                        
                        <div className="fd-hero-stats">
                            <div className="fd-stat">
                                <span className="fd-stat-num">500+</span>
                                <span className="fd-stat-label">Doctors</span>
                            </div>
                            <div className="fd-stat-divider"></div>
                            <div className="fd-stat">
                                <span className="fd-stat-num">50+</span>
                                <span className="fd-stat-label">Specialties</span>
                            </div>
                            <div className="fd-stat-divider"></div>
                            <div className="fd-stat">
                                <span className="fd-stat-num">10K+</span>
                                <span className="fd-stat-label">Happy Patients</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="fd-search-box">
                        <div className="fd-search-header">
                            <div className="fd-search-title">
                                <span className="fd-search-title-icon">✨</span>
                                <h3>Find Your Perfect Doctor</h3>
                            </div>
                            <p className="fd-search-subtitle">Search across 500+ verified doctors and 50+ specialties</p>
                        </div>
                        <div className="fd-search-row">
                            <div className="fd-search-field">
                                <span className="fd-search-icon">📍</span>
                                <input
                                    type="text"
                                    placeholder="Enter your location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                <button className="fd-location-btn" onClick={handleNearMe}>
                                    {isLocating ? '...' : '🎯'}
                                </button>
                            </div>
                            <div className="fd-search-divider"></div>
                            <div className="fd-search-field fd-search-main">
                                <span className="fd-search-icon">👨‍⚕️</span>
                                <input
                                    type="text"
                                    placeholder="Search by name, specialty or symptom..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                                <button className="fd-search-btn">
                                    <span>🔍</span> Search
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="fd-quick-section">
                        <span className="fd-quick-label">Popular:</span>
                        <div className="fd-quick-filters">
                            {availableSpecialties.slice(0, 5).map((spec, index) => (
                                <button
                                    key={spec}
                                    className={`fd-quick-btn ${selectedSpecialty === spec ? 'active' : ''}`}
                                    onClick={() => setSelectedSpecialty(spec)}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {spec === 'All' ? '🌟' : getSpecialtyIcon(spec)} {spec}
                                </button>
                            ))}
                            <button
                                className="fd-quick-btn fd-online-btn"
                                onClick={() => navigate('/video-consult')}
                                style={{ animationDelay: '0.25s' }}
                            >
                                📹 Online Doctor
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="fd-results-section">
                <div className="fd-container">
                    <div className="fd-results-header">
                        <div className="fd-tabs">
                            <button
                                className={`fd-tab ${activeTab === 'doctors' ? 'active' : ''}`}
                                onClick={() => setActiveTab('doctors')}
                            >
                                <span className="fd-tab-icon">👨‍⚕️</span>
                                Doctors
                                <span className="fd-tab-count">{fetchedDoctors.length}</span>
                            </button>
                            <button
                                className={`fd-tab ${activeTab === 'clinics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('clinics')}
                            >
                                <span className="fd-tab-icon">🏥</span>
                                Clinics
                                <span className="fd-tab-count">{filteredClinics.length}</span>
                            </button>
                        </div>
                        
                        <button className="fd-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                            <span>⚙️</span> Filters
                        </button>
                    </div>

                    <div className="fd-main-layout">
                        {showFilters && (
                            <aside className="fd-filters">
                                <div className="fd-filter-header">
                                    <h3>Filters</h3>
                                    <button className="fd-clear-btn" onClick={clearFilters}>Clear All</button>
                                </div>
                                
                                <div className="fd-filter-section">
                                    <label className="fd-filter-label">Specialty</label>
                                    <div className="fd-specialty-list">
                                        {availableSpecialties.map(spec => (
                                            <button
                                                key={spec}
                                                className={`fd-specialty-btn ${selectedSpecialty === spec ? 'active' : ''}`}
                                                onClick={() => setSelectedSpecialty(spec)}
                                            >
                                                {spec}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="fd-filter-section">
                                    <label className="fd-filter-label">Minimum Rating</label>
                                    <div className="fd-rating-slider">
                                        <input
                                            type="range"
                                            min="0"
                                            max="5"
                                            step="0.5"
                                            value={minRating}
                                            onChange={(e) => setMinRating(parseFloat(e.target.value))}
                                        />
                                        <span className="fd-rating-value">{minRating}+ ⭐</span>
                                    </div>
                                </div>

                                <div className="fd-filter-section">
                                    <label className="fd-checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={onlyAvailableToday}
                                            onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                                        />
                                        <span className="fd-checkbox-custom"></span>
                                        <span>Available Today Only</span>
                                    </label>
                                </div>
                            </aside>
                        )}

                        <div className="fd-results-main">
                            {activeTab === 'doctors' ? (
                                <div className="fd-doctors-grid">
                                    {isLoadingResults ? (
                                        <SkeletonCard />
                                    ) : fetchedDoctors.length > 0 ? (
                                        fetchedDoctors.map(doctor => {
                                            const docId = doctor._id || doctor.id
                                            const opdStatus = tokenStates[docId]?.status || 'open'
                                            const mLeft = doctor.schedule?.morning?.totalTokens - (tokenBookings.filter(b => (b.doctorId === docId || b.doctorId?._id === docId) && b.session === 'morning').length) || 0
                                            const eLeft = doctor.schedule?.evening?.totalTokens - (tokenBookings.filter(b => (b.doctorId === docId || b.doctorId?._id === docId) && b.session === 'evening').length) || 0
                                            const hasTokens = (doctor.schedule?.morning?.active && mLeft > 0) || (doctor.schedule?.evening?.active && eLeft > 0)
                                            
                                            const today = new Date().toISOString().split('T')[0]
                                            const isOnVacation = doctor.vacation?.isOnVacation && 
                                                doctor.vacation.vacationStart <= today && 
                                                doctor.vacation.vacationEnd >= today
                                            const isOnLeave = doctor.leave?.some(l => l.date === today)
                                            const isUnavailable = isOnVacation || isOnLeave

                                            return (
                                                <div key={docId} className="fd-doctor-card">
                                                    <div className="fd-card-top">
                                                        <div className="fd-doctor-avatar">
                                                            <span>{doctor.icon}</span>
                                                        </div>
                                                        <div className="fd-doctor-status">
                                                            {isUnavailable ? (
                                                                <span className="fd-status-badge unavailable">
                                                                    {isOnVacation ? 'On Vacation' : 'On Leave'}
                                                                </span>
                                                            ) : hasTokens ? (
                                                                <span className="fd-status-badge available">Available</span>
                                                            ) : (
                                                                <span className="fd-status-badge full">Fully Booked</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="fd-doctor-info">
                                                        <h3 className="fd-doctor-name">{doctor.name}</h3>
                                                        <span className="fd-doctor-specialty">{doctor.specialty}</span>
                                                        <div className="fd-doctor-meta">
                                                            <span className="fd-meta-item">🎓 {doctor.experience}</span>
                                                            <span className="fd-meta-item">⭐ {doctor.rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="fd-doctor-location">
                                                        <span>📍 {doctor.location}</span>
                                                    </div>

                                                    {doctor.schedule && (
                                                        <div className="fd-token-info">
                                                            <div className="fd-token-status">
                                                                {opdStatus === 'paused' ? '⏸ On Break' : opdStatus === 'closed' ? '🔴 Closed' : hasTokens ? '🟢 Tokens Available' : '🔴 Fully Booked'}
                                                            </div>
                                                            <div className="fd-sessions">
                                                                {doctor.schedule.morning.active && (
                                                                    <span className={`fd-session ${mLeft <= 0 ? 'full' : ''}`}>
                                                                        🌅 {mLeft > 0 ? `${mLeft} left` : 'Full'}
                                                                    </span>
                                                                )}
                                                                {doctor.schedule.evening.active && (
                                                                    <span className={`fd-session ${eLeft <= 0 ? 'full' : ''}`}>
                                                                        🌙 {eLeft > 0 ? `${eLeft} left` : 'Full'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <button 
                                                        className="fd-book-btn" 
                                                        onClick={() => handleOpenBooking(doctor)}
                                                        disabled={isUnavailable}
                                                    >
                                                        {isUnavailable ? 'Unavailable' : 'Book Appointment'}
                                                    </button>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="fd-empty-state">
                                            <span className="fd-empty-icon">🔍</span>
                                            <h3>No doctors found</h3>
                                            <p>Try adjusting your filters or search criteria</p>
                                            <button className="fd-reset-btn" onClick={clearFilters}>Reset Filters</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="fd-clinics-grid">
                                    {filteredClinics.length > 0 ? filteredClinics.map(clinic => (
                                        <div key={clinic._id || clinic.id} className="fd-clinic-card">
                                            <div className="fd-clinic-header">
                                                <span className="fd-clinic-icon">{clinic.icon}</span>
                                                <div className="fd-clinic-title">
                                                    <h3>{clinic.name}</h3>
                                                    <p>📍 {clinic.address}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="fd-clinic-meta">
                                                <span>⭐ {clinic.rating} ({clinic.reviews})</span>
                                                <span>👨‍⚕️ {clinic.doctors?.length || 0} Doctors</span>
                                            </div>

                                            <div className="fd-clinic-tags">
                                                {clinic.specialties.slice(0, 3).map(s => (
                                                    <span key={s} className="fd-tag">{s}</span>
                                                ))}
                                            </div>

                                            <div className="fd-clinic-footer">
                                                <span className="fd-clinic-timing">🕐 {clinic.timings}</span>
                                                <button 
                                                    className="fd-clinic-btn"
                                                    onClick={() => navigate(`/clinic/${clinic._id || clinic.id}`)}
                                                >
                                                    View Doctors
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="fd-empty-state">
                                            <span className="fd-empty-icon">🏥</span>
                                            <h3>No clinics found</h3>
                                            <p>Try a different search term</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default FindDoctor
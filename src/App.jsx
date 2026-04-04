import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './auth/Login'
import Register from './auth/Register'
import Profile from './auth/Profile'
import ProtectedRoute from './auth/ProtectedRoute'
import './App.css'

const Home = lazy(() => import('./Home'))
const FindDoctor = lazy(() => import('./FindDoctor'))
const DoctorProfile = lazy(() => import('./DoctorProfile'))
const TokenBooking = lazy(() => import('./TokenBooking'))
const DoctorDashboard = lazy(() => import('./DoctorDashboard'))
const ClinicDetails = lazy(() => import('./ClinicDetails'))
const VideoConsult = lazy(() => import('./VideoConsult'))
const VideoConsultPage = lazy(() => import('./VideoConsultPage'))
const LabTests = lazy(() => import('./LabTests'))
const LabDetailsPage = lazy(() => import('./LabDetailsPage'))
const PackageDetailsPage = lazy(() => import('./PackageDetailsPage'))
const AmbulanceBooking = lazy(() => import('./AmbulanceBooking'))
const Medicines = lazy(() => import('./Medicines'))
const AdminDashboard = lazy(() => import('./FindDoctor-Admin/AdminDashboard'))
const ClinicAdminDashboard = lazy(() => import('./FindDoctor-Admin/ClinicAdminDashboard'))
const ClinicPortal = lazy(() => import('./ClinicPortal'))
const LiveTracking = lazy(() => import('./LiveTracking'))
const BookingHistory = lazy(() => import('./BookingHistory'))
const Settings = lazy(() => import('./Settings'))
const MyPrescriptions = lazy(() => import('./MyPrescriptions'))

// Initial data loaded from API
import * as doctorsApi from './api/doctorsApi'
import * as clinicsApi from './api/clinicsApi'
import * as bookingsApi from './api/bookingsApi'
import axios from 'axios'

function AppContent() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentPath = window.location.pathname
  const isAdminPage = currentPath.startsWith('/admin') || currentPath.startsWith('/clinic-admin') || currentPath === '/doctor-dashboard'
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isFindBtnClicked, setIsFindBtnClicked] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Token System State (Loaded from API)
  const [doctors, setDoctors] = useState([])
  const [clinics, setClinics] = useState([])
  const [tokenBookings, setTokenBookings] = useState([]) // Today's bookings
  const [allBookings, setAllBookings] = useState([]) // Total history for admin
  const [patients, setPatients] = useState([]) // Unique patients from DB
  const [tokenStates, setTokenStates] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const revealRefs = useRef([])
  const revealObserver = useRef(null)
  const sectionObserver = useRef(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Fetch initial data & start polling
  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      try {
        if (isInitial) setIsLoading(true)
        const [docsRes, clinicsRes, bookingsRes, statesRes, allBookingsRes, patientsRes] = await Promise.all([
          doctorsApi.fetchDoctors(),
          clinicsApi.fetchClinics(),
          bookingsApi.fetchTodayBookings(),
          bookingsApi.fetchTokenStates(),
          bookingsApi.fetchBookings(),
          bookingsApi.fetchUniquePatients()
        ])

        if (isInitial && docsRes.data.length === 0) {
          console.log('No data found, seeding...')
          await axios.post('http://localhost:5001/api/seed?force=true')
          window.location.reload()
          return
        }

        setDoctors(docsRes.data)
        setClinics(clinicsRes.data)
        setTokenBookings(bookingsRes.data)
        setTokenStates(statesRes.data)
        setAllBookings(allBookingsRes.data)
        setPatients(patientsRes.data)
      } catch (err) {
        console.error('Data fetch failed:', err)
      } finally {
        if (isInitial) setIsLoading(false)
      }
    }

    fetchData(true)

    // Live tracking interval (every 10 seconds)
    const interval = setInterval(() => {
      fetchData(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    revealObserver.current = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active') }) },
      { threshold: 0.1 }
    )
    sectionObserver.current = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id) }) },
      { threshold: 0.5 }
    )
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
        const dropdown = document.querySelector('.user-dropdown')
        if (dropdown) dropdown.classList.remove('show')
      }
    }
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      if (revealObserver.current) revealObserver.current.disconnect()
      if (sectionObserver.current) sectionObserver.current.disconnect()
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  const addToRevealRefs = (el) => {
    if (el) {
      if (!revealRefs.current.includes(el)) {
        revealRefs.current.push(el)
        if (revealObserver.current) revealObserver.current.observe(el)
      }
      const sections = ['hero', 'how-it-works', 'online-consult', 'articles']
      if (sections.includes(el.id) && sectionObserver.current) sectionObserver.current.observe(el)
    }
  }

  const handleNearMe = () => {
    setIsLocating(true)
    setLocation('Detecting current location...')
    setTimeout(() => { setLocation('Mumbai, Maharashtra'); setIsLocating(false) }, 1500)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 600)
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const toggleMobileMenu = () => {
    const nav = document.getElementById('mainNav')
    const menuBtn = document.getElementById('mobileMenuBtn')
    const menuIcon = menuBtn?.querySelector('.menu-icon')
    const closeIcon = menuBtn?.querySelector('.close-icon')
    
    nav?.classList.toggle('mobile-open')
    if (nav?.classList.contains('mobile-open')) {
      document.body.style.overflow = 'hidden'
      if (menuIcon) menuIcon.style.display = 'none'
      if (closeIcon) closeIcon.style.display = 'block'
    } else {
      document.body.style.overflow = ''
      if (menuIcon) menuIcon.style.display = 'block'
      if (closeIcon) closeIcon.style.display = 'none'
    }
  }

  const closeMobileMenu = () => {
    const nav = document.getElementById('mainNav')
    const menuBtn = document.getElementById('mobileMenuBtn')
    const menuIcon = menuBtn?.querySelector('.menu-icon')
    const closeIcon = menuBtn?.querySelector('.close-icon')
    
    nav?.classList.remove('mobile-open')
    document.body.style.overflow = ''
    if (menuIcon) menuIcon.style.display = 'block'
    if (closeIcon) closeIcon.style.display = 'none'
  }

  // ──────────────────────────────────
  // Token System Handlers (API Based)
  // ──────────────────────────────────

  const handleBookToken = async (doctorId, session, visitType, patientName, patientPhone, bookingDate) => {
    try {
      const res = await bookingsApi.bookToken({
        doctorId, session, visitType, patientName, patientPhone, bookingDate
      })
      if (res.success) {
        setTokenBookings(prev => [...prev, res.data])
        setAllBookings(prev => [...prev, res.data])
        return res.data
      }
    } catch (err) {
      console.error('Booking failed:', err)
      return { error: err.message }
    }
  }

  const handleUpdateTokenState = async (doctorId, newState) => {
    try {
      const res = await bookingsApi.updateTokenState(doctorId, newState)
      if (res.success) {
        setTokenStates(prev => ({ ...prev, [doctorId]: res.data }))
      }
    } catch (err) {
      console.error('Update state failed:', err)
    }
  }

  const handleUpdateSchedule = async (doctorId, newSchedule) => {
    try {
      const res = await doctorsApi.updateDoctor(doctorId, { schedule: newSchedule })
      if (res.success) {
        setDoctors(prev => prev.map(d => (d._id === doctorId || d.id === doctorId) ? res.data : d))
      }
    } catch (err) {
      console.error('Update schedule failed:', err)
    }
  }

  const handleAddDoctor = async (newDoctor) => {
    try {
      const res = await doctorsApi.createDoctor({ ...newDoctor, status: 'pending' })
      if (res.success) {
        setDoctors(prev => [...prev, res.data])
      }
    } catch (err) {
      console.error('Add doctor failed:', err)
    }
  }

  const handleUpdateDoctor = async (updatedDoctor) => {
    try {
      const res = await doctorsApi.updateDoctor(updatedDoctor._id || updatedDoctor.id, updatedDoctor)
      if (res.success) {
        setDoctors(prev => prev.map(d => (d._id === res.data._id || d.id === res.data.id) ? res.data : d))
      }
    } catch (err) {
      console.error('Update doctor failed:', err)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    try {
      const res = await doctorsApi.deleteDoctor(doctorId)
      if (res.success) {
        setDoctors(prev => prev.filter(d => (d._id !== doctorId && d.id !== doctorId)))
      }
    } catch (err) {
      console.error('Delete doctor failed:', err)
    }
  }

  const handleAddClinic = async (newClinic) => {
    try {
      const res = await clinicsApi.createClinic(newClinic)
      if (res.success) {
        setClinics(prev => [...prev, res.data])
      }
    } catch (err) {
      console.error('Add clinic failed:', err)
    }
  }

  const handleUpdateClinic = async (updatedClinic) => {
    try {
      const res = await clinicsApi.updateClinic(updatedClinic._id || updatedClinic.id, updatedClinic)
      if (res.success) {
        setClinics(prev => prev.map(c => (c._id === res.data._id || c.id === res.data.id) ? res.data : c))
      }
    } catch (err) {
      console.error('Update clinic failed:', err)
    }
  }

  const handleDeleteClinic = async (clinicId) => {
    try {
      const res = await clinicsApi.deleteClinic(clinicId)
      if (res.success) {
        setClinics(prev => prev.filter(c => (c._id !== clinicId && c.id !== clinicId)))
      }
    } catch (err) {
      console.error('Delete clinic failed:', err)
    }
  }

  const handleUpdateBookingStatus = async (id, status) => {
    // Optimistic update - update UI immediately
    setAllBookings(prev => prev.map(b => (b._id === id || b.id === id || b.tokenId === id) ? { ...b, status } : b))
    setTokenBookings(prev => prev.map(b => (b._id === id || b.id === id || b.tokenId === id) ? { ...b, status } : b))
    
    try {
      const res = await bookingsApi.updateBookingStatus(id, status)
      if (!res.success) {
        // Revert if API fails
        console.error('API update failed')
      }
    } catch (err) {
      console.error('Update status failed:', err)
    }
  }





  // Filter doctors for public views
  const liveDoctors = doctors.filter(d => d.status === 'approved' || !d.status);

  return (
    <div className="app-container">
      {!isAdminPage && (
        <header className="new-header">
          <div className="new-header-content">
            <Link to="/" className="new-logo">
              <span className="logo-icon">🏥</span>
              <span className="logo-text">Medicare<span>+</span></span>
            </Link>

            <nav className="new-nav-links" id="mainNav">
              <Link to="/" className="new-nav-link" onClick={() => closeMobileMenu()}>🏠 Home</Link>
              <Link to="/find-doctor" className="new-nav-link" onClick={() => closeMobileMenu()}>👨‍⚕️ Find Doctors</Link>
              <Link to="/lab-tests" className="new-nav-link" onClick={() => closeMobileMenu()}>🧪 Lab Tests</Link>
              <Link to="/medicines" className="new-nav-link" onClick={() => closeMobileMenu()}>💊 Medicines</Link>
              <Link to="/ambulance" className="new-nav-link" onClick={() => closeMobileMenu()}>🚑 Ambulance</Link>
            </nav>

            <div className="new-header-actions">
              {user ? (
                <div className="user-menu-container">
                  <button className="user-menu-trigger" onClick={(e) => {
                    e.stopPropagation();
                    const newState = !userMenuOpen;
                    setUserMenuOpen(newState);
                    const dropdown = document.querySelector('.user-dropdown');
                    if (dropdown) {
                      if (newState) {
                        dropdown.classList.add('show');
                      } else {
                        dropdown.classList.remove('show');
                      }
                    }
                  }}>
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user.name}</span>
                    <svg className={`user-chevron ${userMenuOpen ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  <div className={`user-dropdown ${userMenuOpen ? 'show' : ''}`}>
                    <div className="user-dropdown-header">
                      <span className="udh-name">{user.name}</span>
                      <span className="udh-email">{user.email}</span>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link to="/profile" className="user-dropdown-item">
                      <span>👤</span> My Profile
                    </Link>
                    <Link to="/my-bookings" className="user-dropdown-item">
                      <span>📋</span> My Bookings
                    </Link>
                    <Link to="/my-prescriptions" className="user-dropdown-item">
                      <span>💊</span> My Prescriptions
                    </Link>
                    <Link to="/settings" className="user-dropdown-item">
                      <span>⚙️</span> Settings
                    </Link>
                    <Link to="/live-tracking" className="user-dropdown-item">
                      <span>📡</span> Live Tracking
                    </Link>
                    <div className="user-dropdown-divider"></div>
                    <button onClick={logout} className="user-dropdown-item logout">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="login-btn">Login</Link>
                  <Link to="/register" className="app-btn">Sign Up</Link>
                </>
              )}
              <button className="mobile-menu-btn" id="mobileMenuBtn" onClick={toggleMobileMenu}>
                <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <svg className="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'none'}}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      <Suspense fallback={<div className="loading-fallback"><SkeletonCard /></div>}>
        <Routes>
          <Route path="/" element={
            <Home
              location={location} setLocation={setLocation}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              handleNearMe={handleNearMe} isLocating={isLocating}
              handleFindDoctor={() => {
                setIsFindBtnClicked(true)
                setTimeout(() => { setIsFindBtnClicked(false); navigate('/find-doctor') }, 200)
              }}
              isFindBtnClicked={isFindBtnClicked}
              handleSpecialtyClick={(spec) => { setSearchQuery(spec); navigate('/find-doctor') }}
              addToRevealRefs={addToRevealRefs}
              activeSection={activeSection}
              doctors={liveDoctors}
              tokenStates={tokenStates}
              tokenBookings={tokenBookings}
              handleOpenBooking={(doc) => navigate(`/doctor/${doc._id || doc.id}`)}
            />
          } />
          <Route path="/find-doctor" element={
            <FindDoctor
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              location={location} setLocation={setLocation}
              handleNearMe={handleNearMe} isLocating={isLocating}
              isSearching={isSearching} handleSearchChange={handleSearchChange}
              handleOpenBooking={(doc) => navigate(`/doctor/${doc._id || doc.id}`)}
              SkeletonCard={SkeletonCard}
              doctors={liveDoctors}
              clinics={clinics}
              tokenBookings={tokenBookings}
              tokenStates={tokenStates}
            />
          } />
          <Route path="/doctor/:id" element={
            <DoctorProfile
              doctors={liveDoctors}
              tokenBookings={tokenBookings}
              tokenStates={tokenStates}
            />
          } />
          <Route path="/book-token/:id" element={
            <ProtectedRoute>
              <TokenBooking
                doctors={liveDoctors}
                tokenBookings={allBookings}
                onBookToken={handleBookToken}
                tokenStates={tokenStates}
              />
            </ProtectedRoute>
          } />
          <Route path="/doctor-dashboard" element={
            <DoctorDashboard
              doctors={doctors}
              tokenBookings={tokenBookings}
              tokenStates={tokenStates}
              onUpdateTokenState={handleUpdateTokenState}
              onUpdateSchedule={handleUpdateSchedule}
            />
          } />
          <Route path="/clinic/:id" element={
            <ClinicDetails
              clinics={clinics}
              doctors={liveDoctors}
              tokenBookings={tokenBookings}
              tokenStates={tokenStates}
            />
          } />
          <Route path="/video-consult/:id" element={
            <ProtectedRoute>
              <VideoConsult doctors={liveDoctors} />
            </ProtectedRoute>
          } />
          <Route path="/video-consult" element={
            <VideoConsultPage doctors={liveDoctors} />
          } />
          <Route path="/lab-tests" element={
            <ProtectedRoute>
              <LabTests />
            </ProtectedRoute>
          } />
          <Route path="/lab/:id" element={
            <ProtectedRoute>
              <LabDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/package/:id" element={
            <ProtectedRoute>
              <PackageDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/ambulance" element={
            <ProtectedRoute>
              <AmbulanceBooking />
            </ProtectedRoute>
          } />
          <Route path="/medicines" element={
            <ProtectedRoute>
              <Medicines />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <BookingHistory bookings={allBookings} doctors={liveDoctors} clinics={clinics} tokenStates={tokenStates} tokenBookings={tokenBookings} />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/my-prescriptions" element={
            <ProtectedRoute>
              <MyPrescriptions />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminDashboard
              doctors={doctors}
              clinics={clinics}
              tokenBookings={allBookings}
              patients={patients}
              tokenStates={tokenStates}
              onAddDoctor={handleAddDoctor}
              onUpdateDoctor={handleUpdateDoctor}
              onDeleteDoctor={handleDeleteDoctor}
              onAddClinic={handleAddClinic}
              onUpdateClinic={handleUpdateClinic}
              onDeleteClinic={handleDeleteClinic}
              onBookToken={handleBookToken}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          } />
          <Route path="/clinic-admin/:id" element={
            <ClinicAdminWrapper
              clinics={clinics}
              doctors={doctors}
              tokenBookings={tokenBookings}
              tokenStates={tokenStates}
              onUpdateClinic={handleUpdateClinic}
              onUpdateTokenState={handleUpdateTokenState}
              onUpdateDoctor={handleUpdateDoctor}
              onUpdateSchedule={handleUpdateSchedule}
              onBookToken={handleBookToken}
              onAddDoctor={handleAddDoctor}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          } />
          <Route path="/clinic-portals" element={<ClinicPortal clinics={clinics} onAddDoctor={handleAddDoctor} />} />
          <Route path="/live-tracking" element={<LiveTracking tokenStates={tokenStates} tokenBookings={tokenBookings} doctors={liveDoctors} />} />
        </Routes>
      </Suspense>

      {!isAdminPage && (
        <footer className="new-footer">
          <div className="new-footer-grid">
            <div className="new-footer-brand">
              <Link to="/" className="new-logo">
                <span className="logo-icon">🏥</span>
                <span className="logo-text">Medicare<span>+</span></span>
              </Link>
              <p className="new-footer-desc">Experience the future of healthcare with premium consultations, instant tests, and doorstep medicine delivery.</p>
              <div className="new-social-links">
                <span className="social-icon">📱</span>
                <span className="social-icon">💼</span>
                <span className="social-icon">📸</span>
                <span className="social-icon">🐦</span>
              </div>
            </div>
            <div className="new-footer-links">
              <h4>Services</h4>
              <ul>
                <li><Link to="/find-doctor">Find Doctors</Link></li>
                <li><Link to="/video-consult">Video Consult</Link></li>
                <li><Link to="/lab-tests">Lab Tests</Link></li>
                <li><Link to="/ambulance">Ambulance</Link></li>
                <li><Link to="/medicines">Medicines</Link></li>
                <li><Link to="/live-tracking">Live Tracking</Link></li>
              </ul>
            </div>
            <div className="new-footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">About Us</Link></li>
                <li><Link to="/">Our Specialists</Link></li>
                <li><Link to="/">Health Blog</Link></li>
                <li><Link to="/">Contact Us</Link></li>
                <li><Link to="/">FAQs</Link></li>
              </ul>
            </div>
            <div className="new-footer-links">
              <h4>Support</h4>
              <ul>
                <li><Link to="/">Terms & Conditions</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
                <li><Link to="/">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="new-footer-bottom">
            <p>&copy; 2026 Medicare+. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </footer>
      )}

      <button className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={scrollToTop}><span className="arrow">↑</span></button>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

const SkeletonCard = () => (
    <div className="doctor-card skeleton">
      <div className="doctor-info"><div className="skeleton-avatar"></div><div className="doctor-details"><div className="skeleton-line title"></div><div className="skeleton-line text"></div><div className="skeleton-line text short"></div><div className="skeleton-line rating"></div></div></div>
      <div className="doctor-footer"><div className="skeleton-line text"></div><div className="skeleton-btn"></div></div>
    </div>
  )

function ClinicAdminWrapper({ clinics, doctors, tokenBookings, tokenStates, onUpdateClinic, onUpdateTokenState, onUpdateDoctor, onUpdateSchedule, onBookToken, onAddDoctor, onUpdateBookingStatus }) {
  const { id } = useParams()
  const clinic = clinics.find(c => (c._id === id || c.id?.toString() === id))
  return <ClinicAdminDashboard clinic={clinic} doctors={doctors} tokenBookings={tokenBookings} tokenStates={tokenStates} onUpdateClinic={onUpdateClinic} onUpdateTokenState={onUpdateTokenState} onUpdateDoctor={onUpdateDoctor} onUpdateSchedule={onUpdateSchedule} onBookToken={onBookToken} onAddDoctor={onAddDoctor} onUpdateBookingStatus={onUpdateBookingStatus} />
}

export default App

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import './Home.css'

const LABORATORIES = [
  {
    id: 1,
    name: 'Apollo Diagnostics',
    icon: '🏥',
    rating: 4.8,
    reviews: 1250,
    location: 'South Mumbai',
    address: '12, Marine Drive, Mumbai',
    phone: '+91 22 4001 2345',
    timing: 'Mon–Sat: 7 AM – 9 PM',
    price: 350,
    tests: 150,
    homeSample: true,
    accredited: true,
    offers: ['10% OFF on first booking', 'Free home collection'],
    allTests: [
      { name: 'Complete Blood Count (CBC)', price: 350, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Blood Glucose (Fasting)', price: 150, category: 'Blood', fasting: true, duration: '4-6 hours' },
      { name: 'Lipid Profile', price: 600, category: 'Blood', fasting: true, duration: '8-12 hours' },
      { name: 'Thyroid Profile (T3, T4, TSH)', price: 800, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Liver Function Test', price: 700, category: 'Blood', fasting: true, duration: '8-10 hours' },
      { name: 'Kidney Function Test', price: 650, category: 'Blood', fasting: true, duration: '8-10 hours' },
      { name: 'Hemoglobin A1C', price: 500, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Vitamin D Test', price: 1200, category: 'Blood', fasting: false, duration: '48-72 hours' },
      { name: 'Urine Analysis', price: 200, category: 'Urine', fasting: false, duration: '4-6 hours' },
      { name: 'ECG', price: 300, category: 'Heart', fasting: false, duration: '30 mins' },
      { name: 'Chest X-Ray', price: 400, category: 'Imaging', fasting: false, duration: '1 hour' },
    ]
  },
  {
    id: 2,
    name: 'Max Lab',
    icon: '🔬',
    rating: 4.7,
    reviews: 980,
    location: 'Andheri East',
    address: '78, Andheri Kurla Road, Mumbai',
    phone: '+91 22 6700 5555',
    timing: 'Mon–Sun: 6 AM – 10 PM',
    price: 320,
    tests: 180,
    homeSample: true,
    accredited: true,
    offers: ['15% OFF on Gold package'],
    allTests: [
      { name: 'Complete Blood Count (CBC)', price: 320, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Blood Glucose (Fasting)', price: 140, category: 'Blood', fasting: true, duration: '4-6 hours' },
      { name: 'Lipid Profile', price: 550, category: 'Blood', fasting: true, duration: '8-12 hours' },
      { name: 'Thyroid Profile (T3, T4, TSH)', price: 750, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Liver Function Test', price: 650, category: 'Blood', fasting: true, duration: '8-10 hours' },
      { name: 'Kidney Function Test', price: 600, category: 'Blood', fasting: true, duration: '8-10 hours' },
    ]
  },
  {
    id: 3,
    name: 'Dr. Lal PathLabs',
    icon: '🧬',
    rating: 4.9,
    reviews: 2100,
    location: 'Bandra West',
    address: '45, Linking Road, Bandra',
    phone: '+91 22 2640 3030',
    timing: 'Mon–Sat: 6 AM – 8 PM',
    price: 300,
    tests: 200,
    homeSample: true,
    accredited: true,
    offers: ['Free report delivery', 'NABL Accredited'],
    allTests: [
      { name: 'Complete Blood Count (CBC)', price: 300, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Blood Glucose (Fasting)', price: 130, category: 'Blood', fasting: true, duration: '4-6 hours' },
      { name: 'Lipid Profile', price: 500, category: 'Blood', fasting: true, duration: '8-12 hours' },
      { name: 'Thyroid Profile (T3, T4, TSH)', price: 700, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Liver Function Test', price: 600, category: 'Blood', fasting: true, duration: '8-10 hours' },
      { name: 'Kidney Function Test', price: 550, category: 'Blood', fasting: true, duration: '8-10 hours' },
      { name: 'Hemoglobin A1C', price: 450, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Vitamin D Test', price: 1000, category: 'Blood', fasting: false, duration: '48-72 hours' },
      { name: 'Urine Analysis', price: 180, category: 'Urine', fasting: false, duration: '4-6 hours' },
      { name: 'ECG', price: 280, category: 'Heart', fasting: false, duration: '30 mins' },
    ]
  },
  {
    id: 4,
    name: 'SRL Diagnostics',
    icon: '💉',
    rating: 4.6,
    reviews: 850,
    location: 'Powai',
    address: '100, Hiranandani Business Park',
    phone: '+91 22 4321 1234',
    timing: 'Mon–Sat: 7 AM – 7 PM',
    price: 340,
    tests: 140,
    homeSample: true,
    accredited: true,
    offers: ['5% OFF for senior citizens'],
    allTests: [
      { name: 'Complete Blood Count (CBC)', price: 340, category: 'Blood', fasting: false, duration: '6-8 hours' },
      { name: 'Blood Glucose (Fasting)', price: 145, category: 'Blood', fasting: true, duration: '4-6 hours' },
      { name: 'Lipid Profile', price: 520, category: 'Blood', fasting: true, duration: '8-12 hours' },
      { name: 'Thyroid Profile (T3, T4, TSH)', price: 720, category: 'Blood', fasting: false, duration: '6-8 hours' },
    ]
  },
  {
    id: 5,
    name: 'Fortis Lab',
    icon: '🏨',
    rating: 4.8,
    reviews: 1500,
    location: 'Mulund',
    address: 'Fortis Hospital, Mulund',
    phone: '+91 22 6789 0000',
    timing: '24/7 Service',
    price: 380,
    tests: 250,
    homeSample: true,
    accredited: true,
    offers: ['Free home pickup', 'Express reports'],
    allTests: [
      { name: 'Complete Blood Count (CBC)', price: 380, category: 'Blood', fasting: false, duration: '4-6 hours' },
      { name: 'Blood Glucose (Fasting)', price: 160, category: 'Blood', fasting: true, duration: '2-4 hours' },
      { name: 'Lipid Profile', price: 650, category: 'Blood', fasting: true, duration: '6-8 hours' },
      { name: 'Thyroid Profile (T3, T4, TSH)', price: 850, category: 'Blood', fasting: false, duration: '4-6 hours' },
    ]
  }
]

const CATEGORIES = ['All', 'Blood', 'Urine', 'Heart', 'Imaging']

export default function LabDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lab = LABORATORIES.find(l => l.id === parseInt(id))
  
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTests, setSelectedTests] = useState([])
  const [bookingType, setBookingType] = useState('home')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [bookingDetails, setBookingDetails] = useState({
    name: '', phone: '', email: '', date: '', address: '', timeSlot: ''
  })

  const tokens = [
    { id: 'TK001', tokenNum: 1, time: '07:00 AM', status: 'completed', patient: 'John D' },
    { id: 'TK002', tokenNum: 2, time: '07:30 AM', status: 'completed', patient: 'Sarah M' },
    { id: 'TK003', tokenNum: 3, time: '08:00 AM', status: 'current', patient: 'You' },
    { id: 'TK004', tokenNum: 4, time: '08:30 AM', status: 'waiting', patient: 'Waiting...' },
    { id: 'TK005', tokenNum: 5, time: '09:00 AM', status: 'waiting', patient: 'Waiting...' },
    { id: 'TK006', tokenNum: 6, time: '09:30 AM', status: 'waiting', patient: 'Waiting...' },
    { id: 'TK007', tokenNum: 7, time: '10:00 AM', status: 'available', patient: 'Available' },
    { id: 'TK008', tokenNum: 8, time: '10:30 AM', status: 'available', patient: 'Available' },
    { id: 'TK009', tokenNum: 9, time: '11:00 AM', status: 'available', patient: 'Available' },
    { id: 'TK010', tokenNum: 10, time: '11:30 AM', status: 'available', patient: 'Available' },
    { id: 'TK011', tokenNum: 11, time: '12:00 PM', status: 'available', patient: 'Available' },
    { id: 'TK012', tokenNum: 12, time: '12:30 PM', status: 'available', patient: 'Available' },
  ]

  const currentToken = tokens.find(t => t.status === 'current')
  const waitingCount = tokens.filter(t => t.status === 'waiting').length

  const timeSlots = [
    { id: 'morning-1', time: '07:00 - 08:00 AM', period: 'morning', available: 2 },
    { id: 'morning-2', time: '08:00 - 09:00 AM', period: 'morning', available: 3 },
    { id: 'morning-3', time: '09:00 - 10:00 AM', period: 'morning', available: 1 },
    { id: 'morning-4', time: '10:00 - 11:00 AM', period: 'morning', available: 4 },
    { id: 'morning-5', time: '11:00 - 12:00 PM', period: 'morning', available: 2 },
    { id: 'afternoon-1', time: '12:00 - 01:00 PM', period: 'afternoon', available: 3 },
    { id: 'afternoon-2', time: '01:00 - 02:00 PM', period: 'afternoon', available: 0 },
    { id: 'afternoon-3', time: '02:00 - 03:00 PM', period: 'afternoon', available: 2 },
    { id: 'afternoon-4', time: '03:00 - 04:00 PM', period: 'afternoon', available: 5 },
    { id: 'afternoon-5', time: '04:00 - 05:00 PM', period: 'afternoon', available: 3 },
    { id: 'evening-1', time: '05:00 - 06:00 PM', period: 'evening', available: 4 },
    { id: 'evening-2', time: '06:00 - 07:00 PM', period: 'evening', available: 2 },
    { id: 'evening-3', time: '07:00 - 08:00 PM', period: 'evening', available: 1 },
  ]
  const [bookingSuccess, setBookingSuccess] = useState(null)

  const filteredTests = selectedCategory === 'All' 
    ? lab.allTests 
    : lab.allTests.filter(t => t.category === selectedCategory)

  const toggleTest = (testName) => {
    setSelectedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    )
  }

  const totalPrice = selectedTests.reduce((sum, testName) => {
    const test = lab.allTests.find(t => t.name === testName)
    return sum + (test?.price || 0)
  }, 0)

  const handleBookNow = () => {
    if (selectedTests.length === 0 && !selectedToken) return
    setBookingType('home')
    setShowBookingModal(true)
  }

  const handleTokenBook = () => {
    if (!selectedToken) return
    setBookingType('clinic')
    setShowBookingModal(true)
  }

  const handleSubmitBooking = (e) => {
    e.preventDefault()
    const newBooking = {
      id: `LB-${Date.now().toString(36).toUpperCase()}`,
      labName: lab.name,
      testNames: selectedTests,
      date: bookingDetails.date,
      totalPrice
    }
    setBookingSuccess(newBooking)
    setShowBookingModal(false)
  }

  if (!lab) {
    return (
      <div className="lab-details-page">
        <div className="lab-not-found">
          <h2>Lab not found</h2>
          <button onClick={() => navigate('/lab-tests')}>Back to Labs</button>
        </div>
      </div>
    )
  }

  return (
    <div className="lab-details-page-new">
      {/* Hero Section - Modern Design */}
      <div className="lab-hero-modern">
        <button className="back-btn-modern" onClick={() => navigate('/lab-tests')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        
        <div className="hero-modern-grid">
          <div className="hero-modern-left">
            <div className="lab-icon-modern">{lab.icon}</div>
            <div className="lab-info-modern">
              <h1 className="lab-name-modern">{lab.name}</h1>
              <div className="lab-rating-modern">
                <div className="stars-modern">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(lab.rating) ? 'star filled' : 'star'}>★</span>
                  ))}
                </div>
                <span className="rating-num">{lab.rating}</span>
                <span className="reviews-num">({lab.reviews} reviews)</span>
              </div>
              <div className="lab-address-modern">
                <span className="address-icon">📍</span>
                <span>{lab.address}</span>
              </div>
              <div className="lab-timing-modern">
                <span className="timing-icon">🕐</span>
                <span>{lab.timing}</span>
              </div>
            </div>
          </div>
          
          <div className="hero-modern-right">
            <div className="stats-modern-grid">
              <div className="stat-card-modern">
                <span className="stat-icon-modern">🧪</span>
                <span className="stat-value-modern">{lab.tests}+</span>
                <span className="stat-label-modern">Tests</span>
              </div>
              <div className="stat-card-modern">
                <span className="stat-icon-modern">🏠</span>
                <span className="stat-value-modern">Yes</span>
                <span className="stat-label-modern">Home Sample</span>
              </div>
              <div className="stat-card-modern accent">
                <span className="stat-icon-modern">⚡</span>
                <span className="stat-value-modern">24hr</span>
                <span className="stat-label-modern">Reports</span>
              </div>
              {lab.accredited && (
                <div className="stat-card-modern verified">
                  <span className="stat-icon-modern">✓</span>
                  <span className="stat-value-modern">NABL</span>
                  <span className="stat-label-modern">Certified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="offers-modern-row">
          {lab.offers.map((offer, i) => (
            <span key={i} className="offer-tag-modern">{offer}</span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lab-main-modern">
        {/* Left Column - Tests */}
        <div className="tests-column-modern">
          <div className="tests-header-modern">
            <h2>Available Tests</h2>
            <p>Select tests to book your appointment</p>
          </div>

          <div className="category-tabs-modern">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-tab-modern ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                {cat !== 'All' && <span className="cat-count">{filteredTests.filter(t => t.category === cat).length}</span>}
              </button>
            ))}
          </div>

          <div className="tests-list-modern">
            {filteredTests.map((test, i) => (
              <div 
                key={i} 
                className={`test-item-modern ${selectedTests.includes(test.name) ? 'selected' : ''}`}
                onClick={() => toggleTest(test.name)}
              >
                <div className="test-check-modern">
                  {selectedTests.includes(test.name) ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="check-circle"/>
                  )}
                </div>
                <div className="test-info-modern">
                  <h4>{test.name}</h4>
                  <div className="test-meta-modern">
                    <span className="test-cat-badge">{test.category}</span>
                    <span className="test-duration-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      {test.duration}
                    </span>
                    {test.fasting && (
                      <span className="test-fasting-badge">⏱️ Fasting Required</span>
                    )}
                  </div>
                </div>
                <div className="test-price-modern">
                  <span className="price-amount">₹{test.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Booking */}
        <div className="booking-column-modern">
          {/* Visit Options */}
          <div className="booking-option-card">
            <h3>How would you like to avail services?</h3>
            <div className="visit-options-modern">
              <div 
                className={`visit-option-new ${bookingType === 'home' ? 'active' : ''}`}
                onClick={() => setBookingType('home')}
              >
                <div className="option-icon-new">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div className="option-text-new">
                  <h4>Home Sample Collection</h4>
                  <p>Professional phlebotomist visits your home</p>
                </div>
                {bookingType === 'home' && <div className="active-indicator"/>}
              </div>
              <div 
                className={`visit-option-new ${bookingType === 'clinic' ? 'active' : ''}`}
                onClick={() => setBookingType('clinic')}
              >
                <div className="option-icon-new">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="option-text-new">
                  <h4>Visit Lab Directly</h4>
                  <p>Book token and avoid waiting in queue</p>
                </div>
                {bookingType === 'clinic' && <div className="active-indicator"/>}
              </div>
            </div>
          </div>

          {/* Token System - Only show when clinic visit selected */}
          {bookingType === 'clinic' && (
            <div className="token-card-modern">
              <div className="token-header-modern">
                <h3>🎫 Lab Visit Token</h3>
                <p>Select a token to book your slot</p>
              </div>
              <div className="token-status-modern">
                <div className="now-serving">
                  <span className="label">Now Serving</span>
                  <span className="token-num">#{currentToken?.tokenNum || '--'}</span>
                </div>
                <div className="waiting-now">
                  <span className="label">Waiting</span>
                  <span className="wait-count">{waitingCount}</span>
                </div>
              </div>
              <div className="token-slots-modern">
                {tokens.slice(0, 8).map(token => (
                  <button
                    key={token.id}
                    className={`token-slot-modern ${token.status} ${selectedToken === token.id ? 'selected' : ''}`}
                    onClick={() => token.status === 'available' && setSelectedToken(token)}
                    disabled={token.status !== 'available'}
                  >
                    <span className="slot-num">{token.tokenNum}</span>
                    <span className="slot-time">{token.time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tests Summary */}
          <div className="selected-tests-card">
            <div className="selected-header-modern">
              <h3>Selected Tests</h3>
              <span className="test-count">{selectedTests.length} tests</span>
            </div>
            <div className="selected-items-list">
              {selectedTests.length === 0 ? (
                <p className="no-selection">Select tests from the list</p>
              ) : (
                selectedTests.map((testName, i) => {
                  const test = lab.allTests.find(t => t.name === testName)
                  return (
                    <div key={i} className="selected-test-item">
                      <span className="test-name">{testName}</span>
                      <span className="test-price">₹{test?.price}</span>
                    </div>
                  )
                })
              )}
            </div>
            {selectedTests.length > 0 && (
              <div className="total-section-modern">
                <span className="total-label">Total Amount</span>
                <span className="total-amount">₹{totalPrice}</span>
              </div>
            )}
            <button 
              className="book-btn-modern" 
              onClick={handleBookNow}
              disabled={selectedTests.length === 0}
            >
              <span>Book Now</span>
              {selectedTests.length > 0 && <span className="btn-price">₹{totalPrice}</span>}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Contact Card */}
          <div className="contact-card-modern">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Need Help? Call us</span>
              <span className="contact-number">{lab.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay-new" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal-new" onClick={e => e.stopPropagation()}>
            <button className="modal-close-new" onClick={() => setShowBookingModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            
            <div className="modal-header-new">
              <div className="modal-icon-new">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h2>Complete Your Booking</h2>
              <p>{selectedTests.length} tests • ₹{totalPrice}</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="booking-form-new">
              <div className="form-row-new">
                <div className="form-group-new">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    required
                    value={bookingDetails.name}
                    onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>
                <div className="form-group-new">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={bookingDetails.phone}
                    onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})}
                    placeholder="Mobile number"
                  />
                </div>
              </div>
              
              <div className="form-group-new">
                <label>Preferred Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingDetails.date}
                  onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})}
                />
              </div>
              
              <div className="form-group-new">
                <label>Select Time Slot</label>
                <div className="time-slots-new">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`slot-btn-new ${bookingDetails.timeSlot === slot.id ? 'selected' : ''} ${slot.available === 0 ? 'disabled' : ''}`}
                      onClick={() => slot.available > 0 && setBookingDetails({...bookingDetails, timeSlot: slot.id})}
                      disabled={slot.available === 0}
                    >
                      <span className="slot-time-new">{slot.time}</span>
                      <span className="slot-avail">{slot.available > 0 ? `${slot.available} left` : 'Full'}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group-new">
                <label>Collection Address</label>
                <textarea 
                  required
                  value={bookingDetails.address}
                  onChange={e => setBookingDetails({...bookingDetails, address: e.target.value})}
                  placeholder="Enter address for sample collection"
                  rows="2"
                />
              </div>
              
              <button type="submit" className="confirm-btn-new">
                Confirm Booking • ₹{totalPrice}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="modal-overlay-new" onClick={() => setBookingSuccess(null)}>
          <div className="success-modal-new" onClick={e => e.stopPropagation()}>
            <div className="success-icon-new">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2>Booking Confirmed!</h2>
            <p>Your lab test appointment has been booked successfully</p>
            
            <div className="success-details-new">
              <div className="detail-item-new">
                <span className="detail-label">Booking ID</span>
                <span className="detail-value">{bookingSuccess.id}</span>
              </div>
              <div className="detail-item-new">
                <span className="detail-label">Lab</span>
                <span className="detail-value">{bookingSuccess.labName}</span>
              </div>
              <div className="detail-item-new">
                <span className="detail-label">Tests</span>
                <span className="detail-value">{selectedTests.length} tests</span>
              </div>
              <div className="detail-item-new">
                <span className="detail-label">Date</span>
                <span className="detail-value">{bookingDetails.date || 'Not set'}</span>
              </div>
              <div className="detail-item-new total">
                <span className="detail-label">Amount Paid</span>
                <span className="detail-value">₹{totalPrice}</span>
              </div>
            </div>
            
            <button className="done-btn-new" onClick={() => setBookingSuccess(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

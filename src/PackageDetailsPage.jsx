import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import './Home.css'

const TEST_PACKAGES = [
  {
    id: 1,
    name: 'Basic Health Checkup',
    icon: '🩺',
    tests: 10,
    price: 899,
    originalPrice: 1200,
    description: 'Complete blood count + diabetes + lipid profile + liver & kidney function tests',
    popular: false,
    includes: [
      'Complete Blood Count (CBC)',
      'Blood Glucose (Fasting)',
      'Lipid Profile',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT)',
      'Urine Analysis',
      'Hemoglobin',
      'ESR',
      'Blood Group',
      'TSH'
    ],
    preparation: 'Fasting 10-12 hours required. Morning sample collection recommended.',
    reports: 'Reports within 24 hours'
  },
  {
    id: 2,
    name: 'Advanced Full Body Checkup',
    icon: '🏆',
    tests: 25,
    price: 2499,
    originalPrice: 3500,
    description: 'Complete health checkup with thyroid, diabetes, liver, kidney, iron studies + vitamin D',
    popular: true,
    includes: [
      'Complete Blood Count (CBC)',
      'Blood Glucose (Fasting)',
      'HbA1c',
      'Lipid Profile',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT)',
      'Thyroid Profile (T3, T4, TSH)',
      'Iron Studies',
      'Vitamin D',
      'Vitamin B12',
      'Urine Analysis',
      'ECG',
      'Chest X-Ray',
      'Calcium',
      'Phosphorus'
    ],
    preparation: 'Fasting 10-12 hours required. Morning sample collection recommended.',
    reports: 'Reports within 36-48 hours'
  },
  {
    id: 3,
    name: 'Diabetes Screening',
    icon: '🍬',
    tests: 5,
    price: 399,
    originalPrice: 550,
    description: 'Complete diabetes screening and monitoring package',
    popular: false,
    includes: [
      'Fasting Blood Sugar',
      'Post Prandial Blood Sugar',
      'HbA1c',
      'Insulin (Fasting)',
      'Microalbumin'
    ],
    preparation: 'Fasting 10-12 hours required. Bring previous medical records if any.',
    reports: 'Reports within 12-24 hours'
  },
  {
    id: 4,
    name: 'Thyroid Profile',
    icon: '🧠',
    tests: 3,
    price: 599,
    originalPrice: 800,
    description: 'Complete thyroid function test (T3, T4, TSH)',
    popular: false,
    includes: [
      'T3 (Triiodothyronine)',
      'T4 (Thyroxine)',
      'TSH (Thyroid Stimulating Hormone)'
    ],
    preparation: 'No fasting required. Can take thyroid medicines after blood sample.',
    reports: 'Reports within 24 hours'
  },
  {
    id: 5,
    name: 'Heart Health Package',
    icon: '❤️',
    tests: 12,
    price: 1599,
    originalPrice: 2200,
    description: 'Comprehensive heart health checkup with ECG and cardiac markers',
    popular: false,
    includes: [
      'Lipid Profile',
      'ECG',
      '2D Echo (Optional)',
      'C-Reactive Protein (CRP)',
      'Homocysteine',
      'Apolipoprotein A & B',
      'Lipoprotein (a)',
      'Fasting Insulin',
      'HbA1c',
      'Thyroid Profile',
      'Kidney Function Test',
      'Complete Blood Count'
    ],
    preparation: 'Fasting 10-12 hours required. Avoid caffeine before test.',
    reports: 'Reports within 48 hours'
  },
  {
    id: 6,
    name: 'Women Health Package',
    icon: '👩',
    tests: 18,
    price: 1899,
    originalPrice: 2600,
    description: 'Complete health checkup specially designed for women',
    popular: false,
    includes: [
      'Complete Blood Count (CBC)',
      'Blood Glucose (Fasting)',
      'Thyroid Profile (T3, T4, TSH)',
      'Vitamin D',
      'Vitamin B12',
      'Iron Studies',
      'Ferritin',
      'FSH',
      'LH',
      'Prolactin',
      'Estrogen',
      'Ultrasound (Abdomen)',
      'Mammography (Above 40)',
      'Pap Smear',
      'Urine Analysis',
      'Kidney Function Test',
      'Liver Function Test',
      'Lipid Profile'
    ],
    preparation: 'Fasting 10-12 hours required. Some tests need specific timing in menstrual cycle.',
    reports: 'Reports within 48-72 hours'
  }
]

const ALL_LABS = [
  { id: 1, name: 'Apollo Diagnostics', icon: '🏥' },
  { id: 2, name: 'Max Lab', icon: '🔬' },
  { id: 3, name: 'Dr. Lal PathLabs', icon: '🧬' },
  { id: 4, name: 'SRL Diagnostics', icon: '💉' },
  { id: 5, name: 'Metropolis Healthcare', icon: '⚕️' },
]

function PackageDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const packageId = parseInt(id)
  
  const pkg = TEST_PACKAGES.find(p => p.id === packageId) || TEST_PACKAGES[0]
  const [selectedLab, setSelectedLab] = useState(ALL_LABS[0])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    name: '', phone: '', email: '', date: '', address: '', timeSlot: ''
  })

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

  const handleBookNow = () => {
    setShowBookingModal(true)
  }

  const handleSubmitBooking = (e) => {
    e.preventDefault()
    const newBooking = {
      id: `LB-${Date.now().toString(36).toUpperCase()}`,
      packageName: pkg.name,
      labName: selectedLab.name,
      date: bookingDetails.date,
      totalPrice: pkg.price
    }
    setBookingSuccess(newBooking)
    setShowBookingModal(false)
  }

  if (!pkg) {
    return (
      <div className="package-details-page">
        <div className="package-not-found">
          <h2>Package not found</h2>
          <button onClick={() => navigate('/lab-tests')}>Back to Packages</button>
        </div>
      </div>
    )
  }

  return (
    <div className="package-details-page">
      {/* Header */}
      <div className="package-details-hero">
        <button className="back-btn" onClick={() => navigate('/lab-tests')}>
          ← Back to Labs & Packages
        </button>
        
        <div className="package-hero-content">
          <div className="package-hero-left">
            <span className="package-hero-icon">{pkg.icon}</span>
            <div className="package-hero-info">
              <h1>{pkg.name}</h1>
              <div className="package-price-display">
                <span className="current-price">₹{pkg.price}</span>
                <span className="original-price">₹{pkg.originalPrice}</span>
                <span className="discount-badge">{Math.round((1 - pkg.price/pkg.originalPrice) * 100)}% OFF</span>
              </div>
              <p className="package-desc">{pkg.description}</p>
            </div>
          </div>
          
          <div className="package-hero-right">
            <div className="package-stats-row">
              <div className="package-stat">
                <span className="stat-icon">📋</span>
                <span className="stat-num">{pkg.tests}</span>
                <span className="stat-lbl">Tests</span>
              </div>
              <div className="package-stat">
                <span className="stat-icon">🏥</span>
                <span className="stat-num">5+</span>
                <span className="stat-lbl">Labs</span>
              </div>
              <div className="package-stat">
                <span className="stat-icon">⚡</span>
                <span className="stat-num">24h</span>
                <span className="stat-lbl">Reports</span>
              </div>
            </div>
            {pkg.popular && (
              <span className="popular-badge">🔥 Most Popular</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="package-details-main">
        <div className="package-content-left">
          {/* What's Included */}
          <section className="included-section">
            <h2>📋 Tests Included in {pkg.name}</h2>
            <div className="tests-included-grid">
              {pkg.includes.map((test, i) => (
                <div key={i} className="included-test-item">
                  <span className="check-icon">✓</span>
                  <span className="test-name">{test}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Preparation */}
          <section className="prep-section">
            <h2>📝 Preparation Instructions</h2>
            <div className="prep-content">
              <p>{pkg.preparation}</p>
            </div>
          </section>

          {/* Reports */}
          <section className="reports-section">
            <h2>📄 Reports</h2>
            <div className="reports-content">
              <p>🕐 {pkg.reports}</p>
              <p>📱 Reports will be sent via SMS, Email, and WhatsApp</p>
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="booking-sidebar-package">
          <div className="sidebar-card-package">
            <h3>Book This Package</h3>
            
            <div className="lab-select-section">
              <label>Select Lab</label>
              <div className="lab-options">
                {ALL_LABS.map(lab => (
                  <div 
                    key={lab.id}
                    className={`lab-option ${selectedLab.id === lab.id ? 'selected' : ''}`}
                    onClick={() => setSelectedLab(lab)}
                  >
                    <span className="lab-option-icon">{lab.icon}</span>
                    <span className="lab-option-name">{lab.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="package-price-section">
              <div className="price-row">
                <span>Package Price</span>
                <span className="pkg-price">₹{pkg.price}</span>
              </div>
              <div className="price-row">
                <span>Lab</span>
                <span>{selectedLab.name}</span>
              </div>
            </div>

            <button className="book-package-btn" onClick={handleBookNow}>
              Book Now - ₹{pkg.price}
            </button>

            <div className="package-features">
              <div className="feature-item">
                <span>🏠</span>
                <span>Free Home Sample Collection</span>
              </div>
              <div className="feature-item">
                <span>📱</span>
                <span>Digital Reports</span>
              </div>
              <div className="feature-item">
                <span>👨‍⚕️</span>
                <span>Free Doctor Consultation</span>
              </div>
            </div>
          </div>

          <div className="sidebar-info-package">
            <h4>📞 Need Help?</h4>
            <p>Call us for any queries</p>
            <p className="help-phone">+91 22 4000 1234</p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="lab-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="lab-booking-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            
            <div className="booking-modal-header">
              <span className="booking-icon">{pkg.icon}</span>
              <h2>Book {pkg.name}</h2>
              <p className="selected-package">{selectedLab.name} - ₹{pkg.price}</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="booking-form">
              <div className="form-group">
                <label>Patient Name *</label>
                <input 
                  type="text" 
                  required
                  value={bookingDetails.name}
                  onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  value={bookingDetails.phone}
                  onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Preferred Date *</label>
                <input 
                  type="date" 
                  required
                  value={bookingDetails.date}
                  onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Select Time Slot *</label>
                <div className="time-slots-grid">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`time-slot-btn ${bookingDetails.timeSlot === slot.id ? 'selected' : ''} ${slot.available === 0 ? 'unavailable' : ''}`}
                      onClick={() => slot.available > 0 && setBookingDetails({...bookingDetails, timeSlot: slot.id})}
                      disabled={slot.available === 0}
                    >
                      <span className="slot-time">{slot.time}</span>
                      <span className="slot-status">
                        {slot.available === 0 ? 'Full' : `${slot.available} slots`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Sample Collection Address *</label>
                <textarea 
                  required
                  value={bookingDetails.address}
                  onChange={e => setBookingDetails({...bookingDetails, address: e.target.value})}
                  placeholder="Enter address for home sample collection"
                  rows="2"
                />
              </div>
              <button type="submit" className="confirm-booking-btn">
                Confirm Booking - ₹{pkg.price}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="lab-modal-overlay" onClick={() => setBookingSuccess(null)}>
          <div className="lab-success-modal" onClick={e => e.stopPropagation()}>
            <div className="success-animation">✅</div>
            <h2>Booking Confirmed!</h2>
            <div className="success-details">
              <div className="detail-row">
                <span>Booking ID</span>
                <strong>{bookingSuccess.id}</strong>
              </div>
              <div className="detail-row">
                <span>Package</span>
                <strong>{bookingSuccess.packageName}</strong>
              </div>
              <div className="detail-row">
                <span>Lab</span>
                <strong>{bookingSuccess.labName}</strong>
              </div>
              <div className="detail-row">
                <span>Date</span>
                <strong>{bookingDetails.date}</strong>
              </div>
              <div className="detail-row">
                <span>Time Slot</span>
                <strong>{timeSlots.find(s => s.id === bookingDetails.timeSlot)?.time || 'Not selected'}</strong>
              </div>
              <div className="detail-row">
                <span>Amount</span>
                <strong>₹{bookingSuccess.totalPrice}</strong>
              </div>
            </div>
            <button className="done-btn" onClick={() => setBookingSuccess(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageDetailsPage

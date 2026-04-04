import { useState, useEffect } from 'react'
import './AmbulanceBooking.css'

const AMBULANCE_TYPES = [
  { id: 1, name: 'Ambulance', icon: '🚑', capacity: '1 Patient', price: 299 },
  { id: 2, name: 'AC Ambulance', icon: '🚐', capacity: '1 Patient', price: 399 },
  { id: 3, name: 'ICU Ambulance', icon: '🏥', capacity: '1 Patient', price: 699 },
  { id: 4, name: 'Cardiac', icon: '❤️', capacity: '1 Patient', price: 599 },
]

const EMERGENCY_TYPES = [
  { id: 1, name: 'Critical Emergency', icon: '🚨', price: 199, eta: '3-5 min' },
  { id: 2, name: 'ICU Ambulance', icon: '🏥', price: 699, eta: '8-12 min' },
  { id: 3, name: 'Cardiac Ambulance', icon: '❤️', price: 599, eta: '10-15 min' },
]

const MOCK_DRIVERS = [
  { id: 1, name: 'Rajesh K.', phone: '+91 98765 43210', rating: 4.8, trips: 1250, vehicle: 'DL-01-AB-1234' },
  { id: 2, name: 'Suresh P.', phone: '+91 98765 43211', rating: 4.9, trips: 980, vehicle: 'MH-02-CD-5678' },
  { id: 3, name: 'Mohammad K.', phone: '+91 98765 43212', rating: 4.7, trips: 750, vehicle: 'UP-03-EF-9012' },
]

const HOSPITALS = [
  'Apollo Hospital',
  'Fortis Hospital',
  'Max Hospital',
  'Manipal Hospital',
  'Narayana Hospital',
]

function AmbulanceBooking() {
  const [screen, setScreen] = useState('home')
  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [selectedAmbulance, setSelectedAmbulance] = useState(AMBULANCE_TYPES[0])
  const [selectedEmergencyType, setSelectedEmergencyType] = useState(null)
  const [nearbyDriver, setNearbyDriver] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(8)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(5)
  const [bookingId, setBookingId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientCondition, setPatientCondition] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [trackingPosition, setTrackingPosition] = useState(0)
  
  const [bookingHistory] = useState([
    { id: 'AMB-8921', date: '28 Jan', type: 'Ambulance', from: 'Home', to: 'Apollo Hospital', status: 'completed', price: 299, rating: 5 },
    { id: 'AMB-7723', date: '15 Jan', type: 'ICU Ambulance', from: 'Home', to: 'Fortis Hospital', status: 'completed', price: 699, rating: 4 },
  ])

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)]
      setNearbyDriver(randomDriver)
      setEstimatedTime(Math.floor(Math.random() * 10) + 5)
    }
  }, [pickupLocation, dropoffLocation])

  const handleGetCurrentLocation = () => {
    setIsLocating(true)
    setLocationError('')
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setPickupCoords({ lat: latitude, lng: longitude })
          setPickupLocation('Current Location Detected')
          setIsLocating(false)
        },
        (error) => {
          setLocationError('Location access denied. Please enable GPS.')
          setPickupLocation('Mumbai, Maharashtra')
          setPickupCoords({ lat: 19.076, lng: 72.8777 })
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLocationError('Geolocation not supported')
      setPickupLocation('Mumbai, Maharashtra')
      setPickupCoords({ lat: 19.076, lng: 72.8777 })
      setIsLocating(false)
    }
  }

  useEffect(() => {
    if (screen === 'tracking' || screen === 'emergencyTracking') {
      const interval = setInterval(() => {
        setTrackingPosition(prev => {
          if (prev >= 100) return 0
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [screen])

  const handleEmergencySelect = (type) => {
    setSelectedEmergencyType(type)
    handleGetCurrentLocation()
  }

  const handleEmergencyConfirm = () => {
    const id = 'AMB-' + Math.floor(1000 + Math.random() * 9000)
    setBookingId(id)
    const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)]
    setNearbyDriver(randomDriver)
    setEstimatedTime(Math.floor(Math.random() * 5) + 3)
    setScreen('emergencyTracking')
  }

  const handleNormalBooking = () => {
    setScreen('booking')
  }

  const handleConfirmBooking = () => {
    const id = 'AMB-' + Math.floor(1000 + Math.random() * 9000)
    setBookingId(id)
    setScreen('tracking')
  }

  const handleCompleteTrip = () => {
    setShowRating(true)
  }

  const handleSubmitRating = () => {
    setShowRating(false)
    setScreen('home')
    setPickupLocation('')
    setDropoffLocation('')
    setNearbyDriver(null)
    setSelectedEmergencyType(null)
    setTrackingPosition(0)
  }

  const handleEmergency = () => {
    setScreen('emergency')
  }

  const handleCancelEmergency = () => {
    setSelectedEmergencyType(null)
    setScreen('home')
  }

  const selectHospital = (hospital) => {
    setDropoffLocation(hospital)
  }

  const setQuickPickup = () => {
    if (!pickupLocation) {
      handleGetCurrentLocation()
    }
  }

  // Emergency Screen
  if (screen === 'emergency') {
    return (
      <div className="ambulance-booking-page">
        <div className="emergency-screen">
          <button className="btn-back" onClick={() => setScreen('home')}>←</button>
          
          <div className="emergency-header">
            <div className="emergency-pulse">🚨</div>
            <h1>Emergency Ambulance</h1>
            <p>Select emergency type to dispatch immediately</p>
          </div>

          <div className="emergency-types">
            {EMERGENCY_TYPES.map((type) => (
              <div
                key={type.id}
                className={`emergency-type-card ${selectedEmergencyType?.id === type.id ? 'selected' : ''}`}
                onClick={() => handleEmergencySelect(type)}
              >
                <span className="emergency-icon">{type.icon}</span>
                <div className="emergency-info">
                  <h3>{type.name}</h3>
                  <p>ETA: {type.eta}</p>
                </div>
                <span className="emergency-price">₹{type.price}</span>
              </div>
            ))}
          </div>

          {selectedEmergencyType && (
            <div className="emergency-details">
              <h3>Patient Details</h3>
              <input
                type="text"
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <textarea
                placeholder="Describe medical condition..."
                value={patientCondition}
                onChange={(e) => setPatientCondition(e.target.value)}
              ></textarea>
              
              <div className="pickup-preview">
                <span>📍</span>
                <p>{isLocating ? 'Detecting location...' : (pickupLocation || 'Tap to detect')}</p>
                <button className="detect-btn" onClick={handleGetCurrentLocation} disabled={isLocating}>
                  {isLocating ? '...' : '🔄'}
                </button>
              </div>

              <button className="emergency-dispatch-btn" onClick={handleEmergencyConfirm}>
                🚨 Dispatch Ambulance Now
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Emergency Tracking Screen
  if (screen === 'emergencyTracking') {
    return (
      <div className="ambulance-booking-page">
        <div className="tracking-container">
          <div className="tracking-map emergency-map">
            <div className="map-roads">
              <div className="road road-1"></div>
              <div className="road road-2"></div>
              <div className="road road-3"></div>
            </div>
            <div className="map-elements">
              <div className="pickup-marker" style={{ left: `${trackingPosition}%`, top: '60%' }}>
                🚑
              </div>
              <div className="destination-marker" style={{ left: '80%', top: '30%' }}>
                📍
              </div>
            </div>
            <div className="emergency-overlay">
              <span>🚑 Ambulance Dispatched!</span>
            </div>
            <button className="btn-back" onClick={handleCancelEmergency}>←</button>
          </div>
          
          <div className="tracking-info">
            <div className="emergency-status-banner">
              <span className="pulse-icon">🚨</span>
              <span>Emergency Dispatched</span>
            </div>
            
            <div className="tracking-driver">
              <span className="driver-avatar">👨</span>
              <div className="driver-info">
                <h3>{nearbyDriver?.name}</h3>
                <span className="rating">⭐ {nearbyDriver?.rating}</span>
                <span className="vehicle">{nearbyDriver?.vehicle}</span>
              </div>
              <a href={`tel:${nearbyDriver?.phone}`} className="call-btn emergency-call">📞</a>
            </div>
            
            <div className="tracking-status">
              <h2>Ambulance Arriving in {estimatedTime} min</h2>
              <p>🚑 {selectedEmergencyType?.name} - {pickupLocation}</p>
            </div>
            
            <div className="tracking-time emergency-time">
              <div className="time-item">
                <span className="label">Distance</span>
                <span className="value">1.2 km</span>
              </div>
              <div className="time-item">
                <span className="label">Est. Time</span>
                <span className="value">{estimatedTime} min</span>
              </div>
              <div className="time-item">
                <span className="label">Fare</span>
                <span className="value">₹{selectedEmergencyType?.price}</span>
              </div>
            </div>

            {patientCondition && (
              <div className="patient-info-card">
                <h4>Patient Info</h4>
                <p><strong>Name:</strong> {patientName || 'Not provided'}</p>
                <p><strong>Condition:</strong> {patientCondition}</p>
              </div>
            )}
            
            <div className="tracking-actions">
              <button className="share-btn">📤 Share Live Location</button>
              <button className="cancel-btn emergency-cancel" onClick={handleCancelEmergency}>Cancel</button>
            </div>
          </div>
        </div>
        
        <button className="btn-complete-trip" onClick={handleCompleteTrip}>
          ✅ Patient Picked Up - Complete Trip
        </button>
      </div>
    )
  }

  // History Screen
  if (screen === 'history') {
    return (
      <div className="ambulance-booking-page">
        <div className="history-header">
          <h1>My Rides</h1>
          <p>Your ambulance booking history</p>
        </div>
        
        <div className="history-list">
          {bookingHistory.map((booking) => (
            <div key={booking.id} className="history-card">
              <div className="history-card-header">
                <span className="history-id">{booking.id}</span>
                <span className="history-status completed">Completed</span>
              </div>
              <div className="history-route">
                <span className="route-icon">🚑</span>
                <div className="route-points">
                  <p>{booking.from}</p>
                  <p>→ {booking.to}</p>
                </div>
              </div>
              <div className="history-footer">
                <span className="history-type">{booking.type} • ₹{booking.price}</span>
                <span className="history-rating">{'⭐'.repeat(booking.rating)}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button className="btn-back" onClick={() => setScreen('home')}>←</button>
      </div>
    )
  }

  // Normal Tracking Screen
  if (screen === 'tracking') {
    return (
      <div className="ambulance-booking-page">
        <div className="tracking-container">
          <div className="tracking-map">
            <div className="map-roads">
              <div className="road road-1"></div>
              <div className="road road-2"></div>
              <div className="road road-3"></div>
            </div>
            <div className="map-elements">
              <div className="pickup-marker" style={{ left: `${trackingPosition}%`, top: '60%' }}>
                🚑
              </div>
              <div className="destination-marker" style={{ left: '80%', top: '30%' }}>
                📍
              </div>
            </div>
            <button className="btn-back" onClick={() => setScreen('booking')}>←</button>
          </div>
          
          <div className="tracking-info">
            <div className="tracking-driver">
              <span className="driver-avatar">👨</span>
              <div className="driver-info">
                <h3>{nearbyDriver?.name}</h3>
                <span className="rating">⭐ {nearbyDriver?.rating}</span>
                <span className="vehicle">{nearbyDriver?.vehicle}</span>
              </div>
              <a href={`tel:${nearbyDriver?.phone}`} className="call-btn">📞</a>
            </div>
            
            <div className="tracking-status">
              <h2>Driver Arriving in {estimatedTime} min</h2>
              <p>Pickup from {pickupLocation}</p>
            </div>
            
            <div className="tracking-time">
              <div className="time-item">
                <span className="label">Distance</span>
                <span className="value">2.5 km</span>
              </div>
              <div className="time-item">
                <span className="label">Est. Time</span>
                <span className="value">{estimatedTime} min</span>
              </div>
              <div className="time-item">
                <span className="label">Fare</span>
                <span className="value">₹{selectedAmbulance?.price}</span>
              </div>
            </div>
            
            <div className="tracking-actions">
              <button className="share-btn">📤 Share Trip</button>
              <button className="cancel-btn" onClick={() => setScreen('home')}>Cancel</button>
            </div>
          </div>
        </div>
        
        <button className="btn-complete-trip" onClick={handleCompleteTrip}>
          Complete Trip
        </button>
      </div>
    )
  }

  // Booking Screen (Normal)
  if (screen === 'booking') {
    return (
      <div className="ambulance-booking-page">
        <button className="btn-back" onClick={() => setScreen('home')}>←</button>
        
        <div className="booking-screen">
          <div className="location-section">
            <div className="pickup-input">
              <span className="pickup-dot"></span>
              <input
                type="text"
                placeholder="Pickup Location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
              <button className="gps-btn" onClick={handleGetCurrentLocation} disabled={isLocating}>
                {isLocating ? '⏳' : '🎯'}
              </button>
            </div>
            
            <div className="dropoff-input">
              <span className="dropoff-dot"></span>
              <input
                type="text"
                placeholder="Drop Location (Hospital)"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
              />
            </div>
            
            {locationError && <p className="location-error">{locationError}</p>}
          </div>

          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={setQuickPickup}>
              <span className="quick-action-icon">📍</span>
              <span>Current</span>
            </button>
            <button className="quick-action-btn" onClick={() => selectHospital('Apollo Hospital')}>
              <span className="quick-action-icon">🏥</span>
              <span>Hospital</span>
            </button>
            <button className="quick-action-btn" onClick={() => { setPickupLocation('Home'); setDropoffLocation('Hospital') }}>
              <span className="quick-action-icon">🏠</span>
              <span>Home</span>
            </button>
            <button className="quick-action-btn" onClick={() => setScreen('history')}>
              <span className="quick-action-icon">📋</span>
              <span>History</span>
            </button>
          </div>

          {dropoffLocation === 'Hospital' || HOSPITALS.includes(dropoffLocation) ? (
            <div className="hospital-list">
              <h4>Select Hospital</h4>
              {HOSPITALS.map(hospital => (
                <div key={hospital} className="hospital-item" onClick={() => setDropoffLocation(hospital)}>
                  <span>🏥</span>
                  <span>{hospital}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="ambulance-types-section">
            <h3>Select Ambulance</h3>
            <div className="ambulance-types-grid">
              {AMBULANCE_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`ambulance-type-card ${selectedAmbulance?.id === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAmbulance(type)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <h4>{type.name}</h4>
                  <span className="capacity">{type.capacity}</span>
                  <span className="price">₹{type.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-section">
            <h3>Payment</h3>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <span className="payment-icon">💵</span>
                <span>Cash</span>
              </label>
              <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                <span className="payment-icon">📱</span>
                <span>UPI</span>
              </label>
            </div>
          </div>
        </div>

        <div className="confirm-ride-btn">
          <div className="confirm-price">
            <span className="amount">₹{selectedAmbulance?.price}</span>
            <span className="info">{paymentMethod === 'cash' ? 'Pay cash' : 'Pay online'}</span>
          </div>
          <button className="confirm-btn" onClick={handleConfirmBooking} disabled={!pickupLocation}>
            {pickupLocation ? 'Book Ambulance' : 'Enter Pickup'}
          </button>
        </div>

        <button className="emergency-float-btn" onClick={handleEmergency}>🚨</button>
      </div>
    )
  }

  // Rating Modal
  if (showRating) {
    return (
      <div className="rating-modal-overlay" onClick={() => setShowRating(false)}>
        <div className="rating-modal" onClick={e => e.stopPropagation()}>
          <h3>Rate Your Trip</h3>
          <div className="rating-driver">
            <span className="avatar">👨</span>
            <p>{nearbyDriver?.name}</p>
          </div>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} className={`star-btn ${rating >= star ? 'active' : ''}`} onClick={() => setRating(star)}>⭐</button>
            ))}
          </div>
          <textarea placeholder="Share your feedback (optional)..."></textarea>
          <div className="modal-actions">
            <button className="btn-skip" onClick={() => { setShowRating(false); setScreen('home') }}>Skip</button>
            <button className="btn-submit" onClick={handleSubmitRating}>Submit</button>
          </div>
        </div>
      </div>
    )
  }

  // Home Screen
  return (
    <div className="ambulance-booking-page">
      <header className="ambulance-header">
        <div className="ambulance-header-left">
          <span className="ambulance-header-icon">🚑</span>
          <div>
            <h1>Medicare Ambulance</h1>
            <p>Safe & reliable rides</p>
          </div>
        </div>
        <div className="ambulance-header-right">
          <button className="header-icon-btn" onClick={() => setScreen('history')}>📋</button>
        </div>
      </header>

      <div className="home-content">
        <div className="emergency-home-card" onClick={handleEmergency}>
          <div className="emergency-icon-wrapper">
            <span>🚨</span>
          </div>
          <div className="emergency-text">
            <h2>Emergency?</h2>
            <p>Tap for immediate ambulance dispatch</p>
          </div>
          <span className="emergency-arrow">→</span>
        </div>

        <div className="normal-booking-card" onClick={handleNormalBooking}>
          <span className="booking-icon">📅</span>
          <div className="booking-text">
            <h3>Book Scheduled Ambulance</h3>
            <p>Plan in advance for hospital visits</p>
          </div>
          <span className="booking-arrow">→</span>
        </div>

        <div className="recent-rides">
          <h3>Recent Rides</h3>
          {bookingHistory.slice(0, 2).map((booking) => (
            <div key={booking.id} className="recent-ride-card">
              <div className="ride-icon">🚑</div>
              <div className="ride-info">
                <p className="ride-date">{booking.date}</p>
                <p className="ride-route">{booking.from} → {booking.to}</p>
              </div>
              <div className="ride-status">
                <span className="status completed">Completed</span>
                <span className="rating">⭐ {booking.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="emergency-float-btn" onClick={handleEmergency}>🚨</button>
    </div>
  )
}

export default AmbulanceBooking

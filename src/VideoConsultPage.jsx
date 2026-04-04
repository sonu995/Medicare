import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './VideoConsultPage.css'

const SPECIALTIES = [
  { name: 'General Physician', icon: '🩺', desc: 'Cold, cough, fever' },
  { name: 'Dermatology', icon: '🧴', desc: 'Skin & hair issues' },
  { name: 'Gynaecology', icon: '👩‍⚕️', desc: 'Women\'s health' },
  { name: 'Pediatrics', icon: '👶', desc: 'Child healthcare' },
  { name: 'Psychiatry', icon: '🧠', desc: 'Mental health' },
  { name: 'Cardiology', icon: '❤️', desc: 'Heart conditions' },
  { name: 'Orthopedics', icon: '🦴', desc: 'Bone & joints' },
  { name: 'Eye Care', icon: '👁️', desc: 'Vision problems' }
]

const INSTANT_DOCTORS = [
  { id: 1, name: 'Dr. Priya Singh', specialty: 'General Physician', rating: 4.9, waitTime: '< 5 min', icon: '👩‍⚕️' },
  { id: 3, name: 'Dr. Rahul Verma', specialty: 'General Physician', rating: 4.7, waitTime: '< 10 min', icon: '👨‍⚕️' },
]

function VideoConsultPage({ doctors }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [showInstant, setShowInstant] = useState(false)
  const revealRefs = useRef([])
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          }
        })
      },
      { threshold: 0.1 }
    )
    
    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })
    
    return () => observer.disconnect()
  }, [])

  const addToRevealRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const handleInstantConsult = (doctor) => {
    navigate(`/video-consult/${doctor.id}`)
  }

  const handleBookConsult = (doc) => {
    navigate(`/video-consult/${doc.id}`)
  }

  const handleSpecialtyClick = (spec) => {
    setSelectedSpecialty(spec)
    document.getElementById('doctors-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="vcp-page light-theme">
      <section className="vcp-hero-section">
        <div className="vcp-bg-elements">
          <div className="vcp-blob vcp-blob-1"></div>
          <div className="vcp-blob vcp-blob-2"></div>
          <div className="vcp-blob vcp-blob-3"></div>
        </div>
        
        <div className="vcp-hero-container">
          <div className="vcp-hero-content">
            <div className="vcp-badge vcp-fade-in">
              <span className="vcp-badge-dot"></span>
              Trusted by 1M+ Patients
            </div>
            
            <h1 className="vcp-title vcp-fade-in delay-1">
              Instant Video<br />
              <span className="vcp-text-accent">Consultation</span>
            </h1>
            
            <p className="vcp-subtitle vcp-fade-in delay-2">
              Connect with top doctors in minutes. Get prescriptions, 
              medical advice, and follow-up care - all from your home.
            </p>

            <div className="vcp-search-advanced vcp-fade-in delay-3">
              <div className="vcp-search-wrapper">
                <div className="vcp-search-icon-wrapper">
                  <span>🔍</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Search symptoms, doctors, specialties..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="vcp-search-input"
                />
                <button className="vcp-search-btn">
                  Find Doctors
                </button>
              </div>
            </div>

            <div className="vcp-quick-stats vcp-fade-in delay-4">
              <div className="vcp-quick-stat">
                <span className="vcp-stat-number">10k+</span>
                <span className="vcp-stat-text">Verified Doctors</span>
              </div>
              <div className="vcp-stat-divider"></div>
              <div className="vcp-quick-stat">
                <span className="vcp-stat-number">15min</span>
                <span className="vcp-stat-text">Avg. Wait Time</span>
              </div>
              <div className="vcp-stat-divider"></div>
              <div className="vcp-quick-stat">
                <span className="vcp-stat-number">4.9</span>
                <span className="vcp-stat-text">Patient Rating</span>
              </div>
            </div>
          </div>

          <div className="vcp-hero-visual vcp-fade-in delay-2">
            <div className="vcp-hero-card">
              <div className="vcp-card-header">
                <div className="vcp-live-indicator">
                  <span className="vcp-pulse"></span>
                  LIVE
                </div>
                <span className="vcp-online-count">42 doctors online</span>
              </div>
              <div className="vcp-instant-doctors">
                {INSTANT_DOCTORS.map(doc => (
                  <div key={doc.id} className="vcp-instant-doctor" onClick={() => handleInstantConsult(doc)}>
                    <div className="vcp-instant-avatar">{doc.icon}</div>
                    <div className="vcp-instant-info">
                      <h4>{doc.name}</h4>
                      <p>{doc.specialty}</p>
                      <div className="vcp-instant-meta">
                        <span>⭐ {doc.rating}</span>
                        <span className="vcp-wait-badge">⏱️ {doc.waitTime}</span>
                      </div>
                    </div>
                    <button className="vcp-connect-btn">
                      <span>📹</span> Connect
                    </button>
                  </div>
                ))}
              </div>
              <button className="vcp-view-all-btn" onClick={() => setShowInstant(!showInstant)}>
                View All Available Doctors →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="vcp-specialties-section" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-section-header">
            <h2>Consult by Specialty</h2>
            <p>Find the right specialist for your health concern</p>
          </div>
          
          <div className="vcp-specialty-grid">
            {SPECIALTIES.map((spec, index) => (
              <div 
                key={spec.name} 
                className="vcp-specialty-card"
                onClick={() => handleSpecialtyClick(spec.name)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="vcp-specialty-icon">{spec.icon}</div>
                <h3>{spec.name}</h3>
                <p>{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vcp-features-section" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-features-grid">
            <div className="vcp-feature-card">
              <div className="vcp-feature-icon">📹</div>
              <h3>HD Video Call</h3>
              <p>Crystal clear video consultation with doctors</p>
            </div>
            <div className="vcp-feature-card">
              <div className="vcp-feature-icon">💊</div>
              <h3>Digital Prescription</h3>
              <p>Get prescriptions sent to your email instantly</p>
            </div>
            <div className="vcp-feature-card">
              <div className="vcp-feature-icon">🔒</div>
              <h3>100% Private</h3>
              <p>Your health information is completely secure</p>
            </div>
            <div className="vcp-feature-card">
              <div className="vcp-feature-icon">🏠</div>
              <h3>From Home</h3>
              <p>No need to travel - consult from anywhere</p>
            </div>
          </div>
        </div>
      </section>

      <section id="doctors-section" className="vcp-doctors-section" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-section-header">
            <h2>Available Doctors for Video Consult</h2>
            <p>Choose from our verified specialists</p>
          </div>

          <div className="vcp-filters-advanced">
            <button 
              className={`vcp-filter-pill ${selectedSpecialty === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSpecialty('all')}
            >
              All Specialties
            </button>
            {SPECIALTIES.slice(0, 6).map(spec => (
              <button 
                key={spec.name}
                className={`vcp-filter-pill ${selectedSpecialty === spec.name ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty(spec.name)}
              >
                {spec.icon} {spec.name}
              </button>
            ))}
          </div>
          
          <div className="vcp-doctor-grid">
            {filteredDoctors.map((doc, index) => (
              <div 
                key={doc.id} 
                className="vcp-doctor-card-premium"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="vcp-card-top">
                  <div className="vcp-doctor-avatar-large">{doc.icon}</div>
                  <div className="vcp-doctor-info-premium">
                    <h3>{doc.name}</h3>
                    <p className="vcp-specialty-tag">{doc.specialty}</p>
                    <div className="vcp-doctor-meta">
                      <span className="vcp-rating-badge">⭐ {doc.rating}</span>
                      <span className="vcp-experience">{doc.experience}</span>
                    </div>
                  </div>
                </div>
                
                <div className="vcp-clinic-info">
                  <p>📍 {doc.location}</p>
                  <p>🏥 {doc.clinicName}</p>
                </div>

                <div className="vcp-card-bottom">
                  <div className="vcp-price-info">
                    <span className="vcp-fee-label">Consultation Fee</span>
                    <span className="vcp-fee-amount">₹299</span>
                  </div>
                  <button 
                    className="vcp-book-btn-premium"
                    onClick={() => handleBookConsult(doc)}
                  >
                    <span>📹</span> Start Video Call
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="vcp-no-results">
              <span>🔍</span>
              <h3>No doctors found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <section className="vcp-steps-section" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-section-header">
            <h2>How Video Consultation Works</h2>
            <p>Get medical help in 4 simple steps</p>
          </div>
          
          <div className="vcp-steps-grid">
            <div className="vcp-step-card">
              <div className="vcp-step-icon">1</div>
              <h3>Select Doctor</h3>
              <p>Choose a specialist based on your health concern</p>
            </div>
            <div className="vcp-step-card">
              <div className="vcp-step-icon">2</div>
              <h3>Describe Symptoms</h3>
              <p>Share your symptoms and medical history</p>
            </div>
            <div className="vcp-step-card">
              <div className="vcp-step-icon">3</div>
              <h3>Video Consultation</h3>
              <p>Connect via HD video call with the doctor</p>
            </div>
            <div className="vcp-step-card">
              <div className="vcp-step-icon">4</div>
              <h3>Get Prescription</h3>
              <p>Receive digital prescription via email</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vcp-testimonials" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-section-header">
            <h2>What Patients Say</h2>
            <p>Real experiences from our patients</p>
          </div>
          
          <div className="vcp-testimonials-grid">
            <div className="vcp-testimonial-card">
              <div className="vcp-testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="vcp-testimonial-text">
                "Instant video consultation saved me time. The doctor was very thorough and prescribed medicines within 15 minutes!"
              </p>
              <div className="vcp-testimonial-author">
                <div className="vcp-author-avatar">👤</div>
                <div>
                  <h4>Rajesh Kumar</h4>
                  <p>Video Consult Patient</p>
                </div>
              </div>
            </div>
            <div className="vcp-testimonial-card">
              <div className="vcp-testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="vcp-testimonial-text">
                "Great experience! The video call quality was excellent and the doctor answered all my questions patiently."
              </p>
              <div className="vcp-testimonial-author">
                <div className="vcp-author-avatar">👤</div>
                <div>
                  <h4>Priya Sharma</h4>
                  <p>Video Consult Patient</p>
                </div>
              </div>
            </div>
            <div className="vcp-testimonial-card">
              <div className="vcp-testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="vcp-testimonial-text">
                "Very convenient for follow-up consultations. No need to take time off work or travel to the clinic."
              </p>
              <div className="vcp-testimonial-author">
                <div className="vcp-author-avatar">👤</div>
                <div>
                  <h4>Amit Patel</h4>
                  <p>Video Consult Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vcp-cta-section" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-cta-card">
            <div className="vcp-cta-content">
              <h2>Ready to Consult?</h2>
              <p>Connect with top doctors in minutes. Download our app for the best experience.</p>
              <div className="vcp-app-buttons">
                <button className="vcp-app-btn"> App Store</button>
                <button className="vcp-app-btn">▶ Google Play</button>
              </div>
            </div>
            <div className="vcp-cta-visual">📱</div>
          </div>
        </div>
      </section>

      <section className="vcp-faq-section" ref={addToRevealRefs}>
        <div className="vcp-container">
          <div className="vcp-section-header">
            <h2>Frequently Asked Questions</h2>
          </div>
          
          <div className="vcp-faq-grid">
            <div className="vcp-faq-item">
              <h4>How does video consultation work?</h4>
              <p>Simply search for a doctor, book a slot, and join the video call at the scheduled time. You'll receive a digital prescription via email after the consultation.</p>
            </div>
            <div className="vcp-faq-item">
              <h4>Is video consultation secure?</h4>
              <p>Yes, all consultations are 100% private and encrypted. Your health information is never shared with third parties.</p>
            </div>
            <div className="vcp-faq-item">
              <h4>Can I get a prescription through video consultation?</h4>
              <p>Yes, doctors can prescribe medicines digitally after the consultation. The prescription will be sent to your registered email.</p>
            </div>
            <div className="vcp-faq-item">
              <h4>What if the doctor is not available?</h4>
              <p>If your preferred doctor is unavailable, you can choose from other verified specialists or book an appointment for later.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VideoConsultPage

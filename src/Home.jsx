import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import './Home.css'

function Home({
    location, setLocation, searchQuery, setSearchQuery,
    handleNearMe, isLocating, handleFindDoctor, isFindBtnClicked,
    handleSpecialtyClick, addToRevealRefs,
    doctors, handleOpenBooking, tokenStates, tokenBookings
}) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [currentTestimonial, setCurrentTestimonial] = useState(0)
    const [countersActive, setCountersActive] = useState(false)

    const activeBooking = useMemo(() => {
        if (!user || !tokenBookings || tokenBookings.length === 0) return null;
        // Find today's booking for the user (match phone)
        const today = new Date().toDateString();
        const userBookings = tokenBookings.filter(b => 
            b.patientPhone === user.phone && 
            new Date(b.bookingDate).toDateString() === today &&
            b.status !== 'completed'
        );
        // Return the latest booking (by tokenNumber maybe)
        return userBookings.sort((a, b) => b.tokenNumber - a.tokenNumber)[0] || null;
    }, [tokenBookings, user]);

    const activeDoctor = useMemo(() => {
        if (!activeBooking || !doctors) return null;
        return doctors.find(doc => doc._id === activeBooking.doctorId || doc.id?.toString() === activeBooking.doctorId?.toString());
    }, [activeBooking, doctors]);

    const activeState = useMemo(() => {
        if (!activeBooking || !tokenStates) return null;
        return tokenStates[activeBooking.doctorId] || { currentToken: 1, status: 'open' };
    }, [activeBooking, tokenStates]);

    const testimonials = [
        { name: 'Rajesh Kumar', location: 'Mumbai', comment: 'The instant video consultation was a lifesaver. Prescribed in 10 mins. Highly recommend Medicare+!', rating: 5 },
        { name: 'Priya Sharma', location: 'Delhi', comment: 'Booking a clinic visit is so effortless now. Zero waiting time at the clinic! Amazing experience.', rating: 5 },
        { name: 'Amit Varma', location: 'Bangalore', comment: 'Medicines delivered in 2 hours flat. Best healthcare app right now. Very impressed!', rating: 5 },
        { name: 'Sneha Patel', location: 'Ahmedabad', comment: 'My grandmother loves the ambulance service. Quick response and very professional staff.', rating: 5 }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in')
                        if (entry.target.classList.contains('stats-counter')) {
                            setCountersActive(true)
                        }
                    }
                })
            },
            { threshold: 0.2 }
        )
        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const Counter = ({ value, suffix = '', duration = 2000 }) => {
        const [count, setCount] = useState(0)
        useEffect(() => {
            if (!countersActive) return
            let start = 0
            const end = parseInt(value)
            const incrementTime = duration / end
            const timer = setInterval(() => {
                start += 1
                setCount(start)
                if (start >= end) clearInterval(timer)
            }, incrementTime)
            return () => clearInterval(timer)
        }, [countersActive, value])
        return <span>{count}{suffix}</span>
    }

    return (
        <div className="home-page-container">
            {/* ─── HERO SECTION ─── */}
            <section className="h-hero-section" ref={addToRevealRefs}>
                <div className="h-hero-bg-elements">
                    <div className="h-orb h-orb-1"></div>
                    <div className="h-orb h-orb-2"></div>
                    <div className="h-orb h-orb-3"></div>
                    <div className="h-grid-pattern"></div>
                </div>

                <div className="h-hero-content">
                    <div className="h-hero-text">
                        <div className="h-hero-badge">
                            <span className="h-badge-dot"></span>
                            <span>India's #1 Healthcare Platform</span>
                        </div>
                        
                        <h1 className="h-hero-title">
                            Your Health,<br />
                            <span className="h-text-gradient">Our Priority.</span>
                        </h1>
                        
                        <p className="h-hero-subtitle">
                            Connect with top doctors instantly. Book lab tests at home. Get medicines delivered. All from one platform.
                        </p>

                        <div className="h-hero-stats">
                            <div className="h-stat-item">
                                <span className="h-stat-number"><Counter value="1000" suffix="+" /></span>
                                <span className="h-stat-label">Cities Covered</span>
                            </div>
                            <div className="h-stat-divider"></div>
                            <div className="h-stat-item">
                                <span className="h-stat-number"><Counter value="10000" suffix="+" /></span>
                                <span className="h-stat-label">Expert Doctors</span>
                            </div>
                            <div className="h-stat-divider"></div>
                            <div className="h-stat-item">
                                <span className="h-stat-number"><Counter value="50" suffix="L+" /></span>
                                <span className="h-stat-label">Happy Patients</span>
                            </div>
                        </div>

                        {activeBooking && activeState && (
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '16px',
                                padding: '16px',
                                marginBottom: '20px',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Your Token</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>#{activeBooking.tokenNumber}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Currently Serving</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>#{activeState.currentToken || 1}</div>
                                </div>
                                <Link to={`/live-tracking?doctorId=${activeBooking.doctorId?._id || activeBooking.doctorId}&session=${activeBooking.session}&type=${activeBooking.visitType}`} style={{
                                    background: 'white',
                                    color: '#667eea',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: 600
                                }}>Track Live</Link>
                            </div>
                        )}

                        <div className="h-search-bar-wrapper">
                            <div className="h-search-bar">
                                <div className="h-search-field">
                                    <span className="h-field-icon">📍</span>
                                    <input
                                        type="text"
                                        placeholder="Enter city or locality"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="h-search-input"
                                    />
                                    <button className={`h-locate-btn ${isLocating ? 'spinning' : ''}`} onClick={handleNearMe}>
                                        🎯
                                    </button>
                                </div>
                                <div className="h-search-separator"></div>
                                <div className="h-search-field">
                                    <span className="h-field-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search symptoms, doctors, specialties..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-search-input"
                                    />
                                </div>
                                <button
                                    className={`h-search-submit ${isFindBtnClicked ? 'clicked' : ''}`}
                                    onClick={handleFindDoctor}
                                >
                                    <span>Search</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                            </div>
                            <div className="h-search-popular">
                                <span>Popular:</span>
                                {['General Physician', 'Dermatologist', 'Pediatrician', 'Gynecologist'].map(pop => (
                                    <button key={pop} onClick={() => { setSearchQuery(pop); navigate('/find-doctor') }}>{pop}</button>
                                ))}
                            </div>
                            <div className="h-track-token" style={{ marginTop: '12px', textAlign: 'center' }}>
                                <Link to="/live-tracking" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                                    <span>📡</span> Track Your Token
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="h-hero-visual">
                        <div className="h-hero-image-container">
                            <div className="h-hero-image-glow"></div>
                            <img src="/hero-doctor.webp" alt="Healthcare Professional" className="h-hero-img" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600' }} />
                            
                            <div className="h-float-card h-float-card-1">
                                <div className="h-fc-icon">✅</div>
                                <div className="h-fc-content">
                                    <span className="h-fc-title">Verified Doctors</span>
                                    <span className="h-fc-sub">100% Trusted</span>
                                </div>
                            </div>
                            
                            <div className="h-float-card h-float-card-2">
                                <div className="h-fc-rating">⭐ 4.9</div>
                                <span className="h-fc-sub">10k+ Reviews</span>
                            </div>
                            
                            <div className="h-float-card h-float-card-3">
                                <span className="h-fc-time">🕐</span>
                                <div className="h-fc-content">
                                    <span className="h-fc-title">24/7</span>
                                    <span className="h-fc-sub">Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TRUSTED BY BRANDS ─── */}
            <section className="h-trust-section reveal-on-scroll">
                <div className="h-container">
                    <p className="h-trust-label">Trusted by leading healthcare institutions</p>
                    <div className="h-trust-logos">
                        {['Apollo', 'Fortis', 'Max Healthcare', 'Medanta', 'Narayana'].map(brand => (
                            <div key={brand} className="h-trust-logo">{brand}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── QUICK SERVICES ─── */}
            <section className="h-section h-services-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-section-header">
                        <div className="h-sh-text">
                            <span className="h-section-tag">Our Services</span>
                            <h2>Everything you need,<br />in one place</h2>
                        </div>
                    </div>
                    
                    <div className="h-services-grid">
                        <div className="h-service-card h-service-primary" onClick={() => navigate('/find-doctor')} style={{color: 'white'}}>
                            <div className="h-service-icon">👨‍⚕️</div>
                            <h3>Find a Doctor</h3>
                            <p>Book appointments with top specialists near you</p>
                            <div className="h-service-arrow">→</div>
                            <div className="h-service-shine"></div>
                        </div>
                        
                        <div className="h-service-card" onClick={() => { setSearchQuery('Video Consultation'); navigate('/find-doctor') }}>
                            <div className="h-service-icon">📹</div>
                            <h3>Video Consult</h3>
                            <p>Connect with doctors from the comfort of your home</p>
                        </div>
                        
                        <div className="h-service-card" onClick={() => navigate('/lab-tests')}>
                            <div className="h-service-icon">🧪</div>
                            <h3>Lab Tests</h3>
                            <p>Home sample collection & digital reports</p>
                        </div>
                        
                        <div className="h-service-card" onClick={() => navigate('/medicines')}>
                            <div className="h-service-icon">💊</div>
                            <h3>Medicines</h3>
                            <p>Order prescriptions with fast delivery</p>
                        </div>
                        
                        <div className="h-service-card h-service-emergency" onClick={() => navigate('/ambulance')}>
                            <div className="h-service-icon">🚑</div>
                            <h3>Emergency</h3>
                            <p>24/7 ambulance service at your doorstep</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SPECIALTIES ─── */}
            <section className="h-section h-specialty-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-section-header">
                        <div className="h-sh-text">
                            <span className="h-section-tag">Top Specialties</span>
                            <h2>Consult doctors by specialty</h2>
                            <p>Find the right specialist for your health concern</p>
                        </div>
                        <button className="h-view-all-btn" onClick={() => navigate('/find-doctor')}>View All Doctors</button>
                    </div>
                    
                    <div className="h-specialty-carousel">
                        {[
                            { name: 'General Physician', icon: '🩺', desc: 'Cold, fever, headache', color: '#e3f2fd' },
                            { name: 'Dermatology', icon: '🧴', desc: 'Skin, hair, nails', color: '#fce4ec' },
                            { name: 'Gynecology', icon: '👩‍⚕️', desc: 'Women\'s health', color: '#f3e5f5' },
                            { name: 'Pediatrics', icon: '👶', desc: 'Child health', color: '#e8f5e9' },
                            { name: 'Psychiatry', icon: '🧠', desc: 'Mental wellness', color: '#fff3e0' },
                            { name: 'Orthopedics', icon: '🦴', desc: 'Bones & joints', color: '#e0f7fa' },
                            { name: 'Cardiology', icon: '❤️', desc: 'Heart health', color: '#ffebee' },
                            { name: 'Neurology', icon: '🔴', desc: 'Brain & nerves', color: '#f1f8e9' }
                        ].map((spec, i) => (
                            <div key={i} className="h-specialty-card" onClick={() => handleSpecialtyClick(spec.name)} style={{ '--spec-color': spec.color }}>
                                <div className="h-spec-icon">{spec.icon}</div>
                                <h3>{spec.name}</h3>
                                <p>{spec.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── WHY CHOOSE US ─── */}
            <section className="h-section h-why-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-why-grid">
                        <div className="h-why-content">
                            <span className="h-section-tag">Why Medicare+</span>
                            <h2>Healthcare that puts<br />you first</h2>
                            <p className="h-why-desc">We combine technology with compassion to make quality healthcare accessible to everyone.</p>
                            
                            <div className="h-why-features">
                                <div className="h-why-feature">
                                    <div className="h-wf-icon">⚡</div>
                                    <div className="h-wf-content">
                                        <h4>Instant Appointments</h4>
                                        <p>Book same-day appointments with zero waiting time</p>
                                    </div>
                                </div>
                                <div className="h-why-feature">
                                    <div className="h-wf-icon">🔒</div>
                                    <div className="h-wf-content">
                                        <h4>Secure & Private</h4>
                                        <p>Your health data is encrypted and protected</p>
                                    </div>
                                </div>
                                <div className="h-why-feature">
                                    <div className="h-wf-icon">💰</div>
                                    <div className="h-wf-content">
                                        <h4>Affordable Care</h4>
                                        <p>Transparent pricing with no hidden charges</p>
                                    </div>
                                </div>
                                <div className="h-why-feature">
                                    <div className="h-wf-icon">🏆</div>
                                    <div className="h-wf-content">
                                        <h4>Top Specialists</h4>
                                        <p>Network of 10,000+ verified doctors</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-why-visual">
                            <div className="h-why-image-wrapper">
                                <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=600" alt="Healthcare" />
                                <div className="h-why-card">
                                    <span className="h-wc-number">4.9/5</span>
                                    <span className="h-wc-label">Patient Satisfaction</span>
                                    <div className="h-wc-stars">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURED DOCTORS ─── */}
            <section className="h-section h-doctors-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-section-header">
                        <div className="h-sh-text">
                            <span className="h-section-tag">Top Rated</span>
                            <h2>Recommended doctors near you</h2>
                        </div>
                        <Link to="/find-doctor" className="h-view-all-btn">View All</Link>
                    </div>
                    
                    <div className="h-doc-grid">
                        {doctors && doctors.slice(0, 4).map(doctor => (
                            <div key={doctor.id || doctor._id} className="h-doc-card" onClick={() => handleOpenBooking(doctor)}>
                                <div className="h-doc-card-header">
                                    <div className="h-doc-avatar">{doctor.icon || '👨‍⚕️'}</div>
                                    <div className="h-doc-badge">{doctor.experience || '5'} yrs exp</div>
                                </div>
                                <div className="h-doc-info">
                                    <h3>{doctor.name}</h3>
                                    <span className="h-doc-spec">{doctor.specialty}</span>
                                    <div className="h-doc-rating">
                                        <span className="h-rating-star">⭐</span>
                                        <span className="h-rating-value">{doctor.rating || '4.8'}</span>
                                        <span className="h-rating-count">(500+)</span>
                                    </div>
                                </div>
                                <div className="h-doc-meta">
                                    <div className="h-doc-location">
                                        <span>📍</span>
                                        <span>{doctor.location || 'Nearby'}</span>
                                    </div>
                                    <div className="h-doc-fee">
                                        <span className="h-fee-value">₹{doctor.fee || '300'}</span>
                                        <span className="h-fee-label">Consultation</span>
                                    </div>
                                </div>
                                <button className="h-book-btn">Book Appointment</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="h-section h-testimonial-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-section-header center">
                        <span className="h-section-tag">Testimonials</span>
                        <h2>What our patients say</h2>
                        <p>Real stories from real patients</p>
                    </div>
                    
                    <div className="h-testimonial-container">
                        <div className="h-testimonial-main">
                            <div className="h-tm-quote">"</div>
                            <div className="h-tm-content">
                                <p className="h-tm-text">{testimonials[currentTestimonial].comment}</p>
                                <div className="h-tm-rating">
                                    {Array(testimonials[currentTestimonial].rating).fill('⭐').join('')}
                                </div>
                            </div>
                            <div className="h-tm-author">
                                <div className="h-ta-avatar">{testimonials[currentTestimonial].name.charAt(0)}</div>
                                <div className="h-ta-info">
                                    <span className="h-ta-name">{testimonials[currentTestimonial].name}</span>
                                    <span className="h-ta-location">{testimonials[currentTestimonial].location}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-testimonial-nav">
                            {testimonials.map((_, i) => (
                                <button 
                                    key={i} 
                                    className={`h-tn-dot ${i === currentTestimonial ? 'active' : ''}`}
                                    onClick={() => setCurrentTestimonial(i)}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── APP DOWNLOAD CTA ─── */}
            <section className="h-cta-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-cta-card">
                        <div className="h-cta-content">
                            <span className="h-cta-badge">📱 Get the App</span>
                            <h2>Healthcare in your pocket</h2>
                            <p>Download Medicare+ for exclusive offers, faster bookings, and appointment reminders.</p>
                            
                            <div className="h-cta-features">
                                <div className="h-cf-item"><span>✓</span> Exclusive app-only discounts</div>
                                <div className="h-cf-item"><span>✓</span> Quick booking history</div>
                                <div className="h-cf-item"><span>✓</span> Digital prescriptions</div>
                            </div>
                            
                            <div className="h-cta-form">
                                <input type="tel" placeholder="Enter mobile number" className="h-cta-input" />
                                <button className="h-cta-btn">Get App Link</button>
                            </div>
                            
                            <div className="h-cta-store-btns">
                                <button className="h-store-btn">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                    App Store
                                </button>
                                <button className="h-store-btn">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                                    Play Store
                                </button>
                            </div>
                        </div>
                        
                        <div className="h-cta-visual">
                            <div className="h-phone-mockup">
                                <div className="h-phone-screen">
                                    <div className="h-ps-header">
                                        <span>Medicare+</span>
                                    </div>
                                    <div className="h-ps-content">
                                        <div className="h-ps-card">
                                            <span>📅</span>
                                            <span>Upcoming Appointment</span>
                                        </div>
                                        <div className="h-ps-card h-ps-card-accent">
                                            <span>🩺</span>
                                            <span>Dr. Sharma</span>
                                            <small>Today, 3:00 PM</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FAQ SECTION ─── */}
            <section className="h-section h-faq-section reveal-on-scroll">
                <div className="h-container">
                    <div className="h-section-header center">
                        <span className="h-section-tag">FAQs</span>
                        <h2>Frequently asked questions</h2>
                    </div>
                    
                    <div className="h-faq-grid">
                        {[
                            { q: 'How do I book an appointment?', a: 'Simply search for your preferred doctor, select a time slot, and confirm your booking. You\'ll receive an instant confirmation.' },
                            { q: 'Are the doctors verified?', a: 'Yes! All doctors on Medicare+ are verified, licensed professionals with proven credentials and experience.' },
                            { q: 'How do lab tests work?', a: 'Book a test, and our partner labs will collect samples from your home. Results are delivered digitally within 24-48 hours.' },
                            { q: 'Is video consultation secure?', a: 'Absolutely. Our video consultations use end-to-end encryption to ensure your privacy and security.' }
                        ].map((faq, i) => (
                            <div key={i} className="h-faq-item">
                                <h4>{faq.q}</h4>
                                <p>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Home

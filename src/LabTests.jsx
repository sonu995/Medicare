import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './App.css'
import './LabTests.css'

const MY_REPORTS = [
  { id: 'LB-001', testName: 'Complete Blood Count (CBC)', labName: 'Apollo Diagnostics', date: '2026-02-25', status: 'completed', price: 350, reportUrl: '#' },
  { id: 'LB-002', testName: 'Lipid Profile', labName: 'Max Lab', date: '2026-02-20', status: 'completed', price: 600, reportUrl: '#' },
  { id: 'LB-003', testName: 'Thyroid Profile (T3, T4, TSH)', labName: 'Dr. Lal PathLabs', date: '2026-03-01', status: 'pending', price: 800, reportUrl: null },
  { id: 'LB-004', testName: 'Liver Function Test', labName: 'Apollo Diagnostics', date: '2026-02-15', status: 'completed', price: 700, reportUrl: '#' },
  { id: 'LB-005', testName: 'Diabetes Screening Package', labName: 'SRL Diagnostics', date: '2026-03-05', status: 'pending', price: 399, reportUrl: null },
]

const LOCATIONS = [
  'All Locations',
  'South Mumbai',
  'Bandra West',
  'Andheri East',
  'Andheri West',
  'Powai',
  'Lower Parel',
  'Navi Mumbai',
  'Malad West',
  'Juhu',
  'Marine Drive',
  'Kurla'
]

const DIAGNOSTIC_CATEGORIES = [
  { id: 1, name: 'Blood Tests', icon: '🩸', count: 45, tests: ['CBC', 'Blood Glucose', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid', 'Iron Studies', 'Vitamin D', 'HbA1c'] },
  { id: 2, name: 'Heart Health', icon: '❤️', count: 18, tests: ['ECG', '2D Echo', 'TMT', 'Lipid Profile', 'CRP', 'Homocysteine', 'BNP'] },
  { id: 3, name: 'Diabetes', icon: '🍬', count: 12, tests: ['Fasting Blood Sugar', 'PP Blood Sugar', 'HbA1c', 'Insulin', 'C-Peptide', 'Fructosamine'] },
  { id: 4, name: 'Thyroid', icon: '🧠', count: 8, tests: ['T3', 'T4', 'TSH', 'Free T3', 'Free T4', 'Anti-TPO', 'Thyroglobulin'] },
  { id: 5, name: 'Bone & Joint', icon: '🦴', count: 10, tests: ['Calcium', 'Vitamin D', 'Phosphorus', 'Uric Acid', 'RA Factor', 'Anti-CCP'] },
  { id: 6, name: 'Fertility', icon: '👶', count: 15, tests: ['FSH', 'LH', 'Prolactin', 'Testosterone', 'Estrogen', 'Progesterone', 'AMH', 'Semen Analysis'] },
  { id: 7, name: 'Infection', icon: '🦠', count: 20, tests: ['HIV', 'Hepatitis B', 'Hepatitis C', 'Typhoid', 'Malaria', 'Dengue', 'Widal'] },
  { id: 8, name: 'Urine & Stool', icon: '🧪', count: 12, tests: ['Urine Routine', 'Urine Culture', 'Stool Routine', 'Stool Occult Blood'] },
  { id: 9, name: 'Imaging', icon: '📷', count: 15, tests: ['X-Ray', 'Ultrasound', 'CT Scan', 'MRI', 'Mammography', 'Bone Densitometry'] },
  { id: 10, name: 'COVID-19', icon: '😷', count: 6, tests: ['RT-PCR', 'Rapid Antigen', 'Antibody Test', 'Full Panel'] }
]

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
    offers: ['10% OFF on first booking', 'Free home collection']
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
    offers: ['15% OFF on Gold package']
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
    offers: ['Free report delivery', 'NABL Accredited']
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
    offers: ['5% OFF for senior citizens']
  },
  {
    id: 5,
    name: 'Metropolis Healthcare',
    icon: '⚕️',
    rating: 4.7,
    reviews: 1100,
    location: 'Lower Parel',
    address: 'India Bulls Finance Centre, Elphinstone',
    phone: '+91 22 6170 0000',
    timing: 'Mon–Sat: 7 AM – 8 PM',
    price: 360,
    tests: 170,
    homeSample: true,
    accredited: true,
    offers: ['Cashback 5% on UPI']
  },
  {
    id: 6,
    name: 'Thyrocare Technologies',
    icon: '🧪',
    rating: 4.5,
    reviews: 1800,
    location: 'Navi Mumbai',
    address: 'D-37/1, MIDC, Turbhe',
    phone: '+91 22 4122 2222',
    timing: 'Mon–Sun: 6 AM – 6 PM',
    price: 280,
    tests: 120,
    homeSample: true,
    accredited: false,
    offers: ['Lowest price guarantee', 'Free fasting glucose with profile']
  }
]

const TEST_PACKAGES = [
  {
    id: 1,
    name: 'Basic Health Checkup',
    icon: '🩺',
    tests: 10,
    price: 899,
    originalPrice: 1200,
    description: 'CBC, Blood Glucose, Lipid Profile, Liver & Kidney Function',
    popular: false,
    labs: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 2,
    name: 'Advanced Full Body Checkup',
    icon: '🏆',
    tests: 25,
    price: 2499,
    originalPrice: 3500,
    description: 'Complete Blood Count + Thyroid + Diabetes + Liver + Kidney + Iron Studies',
    popular: true,
    labs: [1, 2, 3, 4, 5]
  },
  {
    id: 3,
    name: 'Diabetes Screening',
    icon: '🍬',
    tests: 5,
    price: 399,
    originalPrice: 550,
    description: 'Fasting Blood Sugar, PP Blood Sugar, HbA1c',
    popular: false,
    labs: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 4,
    name: 'Thyroid Profile',
    icon: '🧠',
    tests: 3,
    price: 599,
    originalPrice: 800,
    description: 'T3, T4, TSH',
    popular: false,
    labs: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 5,
    name: 'Heart Health Package',
    icon: '❤️',
    tests: 12,
    price: 1599,
    originalPrice: 2200,
    description: 'Lipid Profile, ECG, CRP, Homocysteine, Apolipoproteins',
    popular: false,
    labs: [1, 2, 3]
  },
  {
    id: 6,
    name: 'Women Health Package',
    icon: '👩',
    tests: 18,
    price: 1899,
    originalPrice: 2600,
    description: 'CBC, Thyroid, Vitamin D, Iron, FSH, LH, Prolactin',
    popular: false,
    labs: [1, 2, 3, 4, 5]
  }
]

const POPULAR_TESTS = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 350, icon: '🩸' },
  { id: 2, name: 'Blood Glucose (Fasting)', price: 150, icon: '🍬' },
  { id: 3, name: 'Lipid Profile', price: 600, icon: '❤️' },
  { id: 4, name: 'Thyroid Profile (T3, T4, TSH)', price: 800, icon: '🧠' },
  { id: 5, name: 'Liver Function Test', price: 700, icon: '🫁' },
  { id: 6, name: 'Hemoglobin A1C', price: 500, icon: '📊' },
  { id: 7, name: 'Vitamin D Test', price: 1200, icon: '☀️' },
  { id: 8, name: 'Kidney Function Test', price: 650, icon: '🫘' },
]

function LabTests({ laboratories = LABORATORIES, testPackages = TEST_PACKAGES }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('diagnostics')
  const [selectedLab, setSelectedLab] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    name: '', phone: '', email: '', date: '', address: '', packageId: null, labId: null
  })
  const [bookingSuccess, setBookingSuccess] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [myReports, setMyReports] = useState(MY_REPORTS)
  const [activeSection, setActiveSection] = useState('book')

  const filteredLabs = laboratories
    .filter(lab => {
      const matchesLocation = selectedLocation === 'All Locations' || lab.location === selectedLocation
      return matchesLocation
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'reviews') return b.reviews - a.reviews
      return 0
    })

  const searchFilteredLabs = searchQuery
    ? filteredLabs.filter(lab =>
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : filteredLabs

  const handleLabSelect = (lab) => {
    navigate(`/lab/${lab.id}`)
  }

  const handlePackageSelect = (pkg) => {
    navigate(`/package/${pkg.id}`)
  }

  const handleSubmitBooking = (e) => {
    e.preventDefault()
    const newBooking = {
      id: `LB-${Date.now().toString(36).toUpperCase()}`,
      labName: laboratories.find(l => l.id === bookingDetails.labId)?.name,
      packageName: testPackages.find(p => p.id === bookingDetails.packageId)?.name,
      date: bookingDetails.date,
      address: bookingDetails.address,
      status: 'confirmed'
    }
    setBookingSuccess(newBooking)
    setShowBookingModal(false)
  }

  const handleQuickBook = (test) => {
    const defaultLab = laboratories[0]
    setSelectedLab(defaultLab)
    setSelectedPackage(null)
    setShowBookingModal(true)
    setBookingDetails(prev => ({
      ...prev,
      packageId: null,
      labId: defaultLab.id,
      testName: test.name || test
    }))
  }

  const handleDiagnosticTestBook = (testName) => {
    const defaultLab = laboratories[0]
    setSelectedLab(defaultLab)
    setSelectedPackage(null)
    setShowBookingModal(true)
    setBookingDetails(prev => ({
      ...prev,
      packageId: null,
      labId: defaultLab.id,
      testName: testName
    }))
    setSelectedDiagnostic(null)
  }

  return (
    <div className="lab-landing-page">
      {/* Hero Section */}
      <div className="lab-hero-section">
        <div className="lab-hero-bg">
          <div className="lab-hero-shape shape-1"></div>
          <div className="lab-hero-shape shape-2"></div>
          <div className="lab-hero-shape shape-3"></div>
        </div>
        <div className="lab-hero-content">
          {/* Navigation Tabs */}
          <div className="lab-tabs-nav">
            <button
              className={`lab-tab-btn ${activeSection === 'book' ? 'active' : ''}`}
              onClick={() => setActiveSection('book')}
            >
              🔍 Book Tests
            </button>
            <button
              className={`lab-tab-btn ${activeSection === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveSection('reports')}
            >
              📄 My Reports
              {myReports.filter(r => r.status === 'completed').length > 0 && (
                <span className="tab-badge">{myReports.filter(r => r.status === 'completed').length}</span>
              )}
            </button>
          </div>

          {activeSection === 'book' && (
            <>
              <div className="lab-hero-badge">
                <span>🧪</span> Trusted by 5 Lac+ Customers
              </div>
              <h1>Book Lab Tests Online</h1>
              <p>Get diagnostic tests done at your nearest lab or at home. Free sample collection, accurate reports, and best prices.</p>

              <div className="lab-hero-stats">
                <div className="lab-stat">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">Labs</span>
                </div>
                <div className="lab-stat">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Tests</span>
                </div>
                <div className="lab-stat">
                  <span className="stat-number">24hrs</span>
                  <span className="stat-label">Reports</span>
                </div>
                <div className="lab-stat">
                  <span className="stat-number">4.8</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </>
          )}

          {/* My Reports View */}
          {activeSection === 'reports' && (
            <div className="my-reports-hero">
              <div className="reports-hero-icon">📋</div>
              <h1>My Lab Reports</h1>
              <p>View and download your lab test reports</p>
              <div className="reports-summary">
                <div className="summary-item">
                  <span className="summary-num">{myReports.filter(r => r.status === 'completed').length}</span>
                  <span className="summary-label">Reports Ready</span>
                </div>
                <div className="summary-item pending">
                  <span className="summary-num">{myReports.filter(r => r.status === 'pending').length}</span>
                  <span className="summary-label">Pending</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar - Only show for booking section */}
      {activeSection === 'book' && (
        <div className="lab-search-section">
          <div className="lab-search-bar">
            <div className="search-field location-field">
              <span className="search-icon">📍</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="location-select"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <button
                className={`near-me-btn ${isLocating ? 'locating' : ''}`}
                onClick={() => {
                  setIsLocating(true)
                  setTimeout(() => {
                    setSelectedLocation('Mumbai')
                    setIsLocating(false)
                  }, 1000)
                }}
              >
                {isLocating ? '⏳' : '🎯'}
              </button>
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tests, packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Booking Section */}
      {activeSection === 'book' && (
        <div className="lab-main-content">

          {/* Diagnostic Categories */}
          <section className="lab-diagnostics-section">
            <div className="section-header-row">
              <h2>🔬 Diagnostic Tests by Category</h2>
              <div className="view-tabs">
                <button className={`view-tab ${activeTab === 'diagnostics' ? 'active' : ''}`} onClick={() => setActiveTab('diagnostics')}>Diagnostics</button>
                <button className={`view-tab ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>Packages</button>
                <button className={`view-tab ${activeTab === 'labs' ? 'active' : ''}`} onClick={() => setActiveTab('labs')}>Labs</button>
              </div>
            </div>

            <div className="diagnostics-grid">
              {DIAGNOSTIC_CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  className={`diagnostic-card ${selectedDiagnostic?.id === cat.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDiagnostic(cat)}
                >
                  <span className="diagnostic-icon">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <span className="diagnostic-count">{cat.count} tests</span>
                </div>
              ))}
            </div>

            {selectedDiagnostic && (
              <div className="diagnostic-tests-panel">
                <div className="panel-header">
                  <h3>{selectedDiagnostic.icon} {selectedDiagnostic.name} Tests</h3>
                  <button className="close-panel" onClick={() => setSelectedDiagnostic(null)}>×</button>
                </div>
                <div className="tests-list">
                  {selectedDiagnostic.tests.map((test, i) => (
                    <div key={i} className="test-item">
                      <span className="test-name">{test}</span>
                      <button className="quick-book-btn" onClick={() => handleDiagnosticTestBook(test)}>Book</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Popular Tests */}
          <section className="lab-popular-section">
            <div className="section-header-row">
              <h2>🔥 Popular Tests</h2>
              <button className="view-all-btn" onClick={() => setActiveTab('tests')}>View All →</button>
            </div>
            <div className="popular-tests-grid">
              {POPULAR_TESTS.map(test => (
                <div key={test.id} className="popular-test-card" onClick={() => handleQuickBook(test)}>
                  <span className="test-icon">{test.icon}</span>
                  <div className="test-info">
                    <h4>{test.name}</h4>
                    <span className="test-price">₹{test.price}</span>
                  </div>
                  <button className="book-test-btn">Book</button>
                </div>
              ))}
            </div>
          </section>

          {/* Test Packages */}
          <section className="lab-packages-section">
            <div className="section-header-row">
              <h2>📦 Health Packages</h2>
              <div className="package-tabs">
                <button className={`pkg-tab ${activeTab === 'labs' ? 'active' : ''}`} onClick={() => setActiveTab('labs')}>All Labs</button>
                <button className={`pkg-tab ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>Packages</button>
              </div>
            </div>

            <div className="packages-grid">
              {testPackages.map(pkg => (
                <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                  {pkg.popular && <span className="popular-tag">Most Popular</span>}
                  <div className="package-header">
                    <span className="package-icon">{pkg.icon}</span>
                    <div className="package-price">
                      <span className="original-price">₹{pkg.originalPrice}</span>
                      <span className="current-price">₹{pkg.price}</span>
                    </div>
                  </div>
                  <h3>{pkg.name}</h3>
                  <p className="package-desc">{pkg.description}</p>
                  <div className="package-meta">
                    <span>📋 {pkg.tests} tests included</span>
                    <span>🏥 {pkg.labs.length} labs available</span>
                  </div>
                  <button className="package-book-btn" onClick={() => handlePackageSelect(pkg)}>
                    Book Now →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Labs Section */}
          <section className="labs-section">
            <div className="section-header-row">
              <h2>🏥 Our Partner Labs</h2>
              <div className="sort-options">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rating">Sort by Rating</option>
                  <option value="price">Sort by Price</option>
                  <option value="reviews">Sort by Reviews</option>
                </select>
              </div>
            </div>

            <div className="labs-grid">
              {searchFilteredLabs.length > 0 ? searchFilteredLabs.map(lab => (
                <div key={lab.id} className="lab-card-new">
                  <div className="lab-card-badge">
                    {lab.accredited && <span className="nabl-badge">★ NABL Accredited</span>}
                  </div>

                  <div className="lab-card-main">
                    <div className="lab-logo-area">
                      <span className="lab-logo-icon">{lab.icon}</span>
                    </div>
                    <div className="lab-info">
                      <h3>{lab.name}</h3>
                      <div className="lab-rating-new">
                        <span className="stars">⭐⭐⭐⭐⭐</span>
                        <span className="rating-num">{lab.rating}</span>
                        <span className="reviews-num">({lab.reviews} reviews)</span>
                      </div>
                      <p className="lab-address-new">📍 {lab.address}</p>
                    </div>
                  </div>

                  <div className="lab-stats-row">
                    <div className="lab-stat-item">
                      <span className="stat-icon">🧪</span>
                      <span className="stat-text">{lab.tests}+ Tests</span>
                    </div>
                    <div className="lab-stat-item">
                      <span className="stat-icon">🏠</span>
                      <span className="stat-text">Home Sample</span>
                    </div>
                    <div className="lab-stat-item">
                      <span className="stat-icon">⚡</span>
                      <span className="stat-text">24-48 Hrs</span>
                    </div>
                  </div>

                  <div className="lab-offers-row">
                    {lab.offers.map((offer, i) => (
                      <span key={i} className="offer-pill">{offer}</span>
                    ))}
                  </div>

                  <div className="lab-timing-row">
                    <span>🕐 {lab.timing}</span>
                  </div>

                  <div className="lab-card-actions">
                    <div className="lab-price-section">
                      <span className="price-label-new">Starting at</span>
                      <span className="price-amount-new">₹{lab.price}</span>
                    </div>
                    <button className="lab-book-btn" onClick={() => handleLabSelect(lab)}>
                      Book Now
                    </button>
                  </div>
                </div>
              )) : (
                <div className="no-labs-found">
                  <span className="no-labs-icon">🔍</span>
                  <h3>No labs found</h3>
                  <p>Try selecting a different location or clear filters</p>
                  <button onClick={() => { setSelectedLocation('All Locations'); setSearchQuery('') }}>Clear Filters</button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Why Choose Us - Only show in booking mode */}
      {activeSection === 'book' && (
        <section className="lab-why-section">
          <h2>Why Choose Medicare+ Lab Tests?</h2>
          <div className="why-grid">
            <div className="why-card">
              <span className="why-icon">🏠</span>
              <h4>Home Sample Collection</h4>
              <p>Professional phlebotomist will visit your home for sample collection</p>
            </div>
            <div className="why-card">
              <span className="why-icon">📱</span>
              <h4>Digital Reports</h4>
              <p>Get your reports via SMS, Email, or WhatsApp within 24-48 hours</p>
            </div>
            <div className="why-card">
              <span className="why-icon">💰</span>
              <h4>Best Prices</h4>
              <p>Compare prices across labs and get exclusive discounts</p>
            </div>
            <div className="why-card">
              <span className="why-icon">🔒</span>
              <h4>NABL Accredited</h4>
              <p>Partnered with trusted, quality-certified laboratories</p>
            </div>
          </div>
        </section>
      )}

      {/* My Reports Section */}
      {activeSection === 'reports' && (
        <section className="my-reports-section">
          <div className="reports-container">
            <div className="reports-list">
              {myReports.map(report => (
                <div key={report.id} className="report-card-new">
                  <div className="report-header-new">
                    <div className="report-icon-area">
                      <span className="report-type-icon">🧪</span>
                    </div>
                    <div className="report-main-info">
                      <h3>{report.testName}</h3>
                      <p className="report-lab">🏥 {report.labName}</p>
                      <p className="report-date">📅 {report.date}</p>
                    </div>
                    <div className={`report-status-badge ${report.status}`}>
                      {report.status === 'completed' ? '✅ Ready' : '⏳ Pending'}
                    </div>
                  </div>

                  <div className="report-footer-new">
                    <div className="report-price-area">
                      <span className="price-label">Amount</span>
                      <span className="price-value">₹{report.price}</span>
                    </div>
                    {report.status === 'completed' ? (
                      <div className="report-actions">
                        <button className="view-report-btn" onClick={() => alert(`Opening report for ${report.testName}`)}>
                          👁️ View Report
                        </button>
                        <button className="download-report-btn" onClick={() => alert(`Downloading report for ${report.testName}`)}>
                          ⬇️ Download PDF
                        </button>
                      </div>
                    ) : (
                      <div className="report-actions">
                        <button className="pending-info-btn">
                          📞 Sample Collected
                        </button>
                        <span className="pending-note">Report will be ready in 24-48 hours</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {myReports.length === 0 && (
              <div className="no-reports-state">
                <span className="empty-icon">📋</span>
                <h3>No Reports Yet</h3>
                <p>Your booked lab tests will appear here</p>
                <button onClick={() => setActiveSection('book')}>Book a Test</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="lab-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="lab-booking-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>

            <div className="booking-modal-header">
              <span className="booking-icon">🧪</span>
              <h2>Book Lab Test</h2>
              {selectedPackage ? (
                <p className="selected-package">{selectedPackage.name} - ₹{selectedPackage.price}</p>
              ) : bookingDetails.testName ? (
                <p className="selected-package">{bookingDetails.testName}</p>
              ) : null}
            </div>

            <form onSubmit={handleSubmitBooking} className="booking-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingDetails.name}
                    onChange={e => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={bookingDetails.phone}
                    onChange={e => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={bookingDetails.email}
                  onChange={e => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                  placeholder="Enter email for report delivery"
                />
              </div>

              <div className="form-group">
                <label>Select Lab *</label>
                <select
                  required
                  value={bookingDetails.labId || ''}
                  onChange={e => setBookingDetails({ ...bookingDetails, labId: parseInt(e.target.value) })}
                >
                  <option value="">Choose a laboratory</option>
                  {laboratories.map(lab => (
                    <option key={lab.id} value={lab.id}>{lab.icon} {lab.name} - {lab.location}</option>
                  ))}
                </select>
              </div>

              {selectedPackage && (
                <div className="form-group">
                  <label>Select Package *</label>
                  <select
                    required
                    value={bookingDetails.packageId || ''}
                    onChange={e => {
                      const pkg = testPackages.find(p => p.id === parseInt(e.target.value))
                      setBookingDetails({ ...bookingDetails, packageId: parseInt(e.target.value) })
                      setSelectedPackage(pkg)
                    }}
                  >
                    <option value="">Choose a package</option>
                    {testPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.icon} {pkg.name} - ₹{pkg.price}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={bookingDetails.date}
                  onChange={e => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Sample Collection Address *</label>
                <textarea
                  required
                  value={bookingDetails.address}
                  onChange={e => setBookingDetails({ ...bookingDetails, address: e.target.value })}
                  placeholder="Enter full address for home sample collection"
                  rows="2"
                />
              </div>

              <div className="form-note">
                <span>ℹ️</span> A confirmation call will be made before sample collection.
              </div>

              <button type="submit" className="confirm-booking-btn">
                Confirm Booking - ₹{selectedPackage?.price || (bookingDetails.testName ? '500' : '---')}
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
            <p>Your lab test has been successfully booked.</p>

            <div className="success-details">
              <div className="detail-row">
                <span>Booking ID</span>
                <strong>{bookingSuccess.id}</strong>
              </div>
              <div className="detail-row">
                <span>Lab</span>
                <strong>{bookingSuccess.labName}</strong>
              </div>
              <div className="detail-row">
                <span>Package</span>
                <strong>{bookingSuccess.packageName}</strong>
              </div>
              <div className="detail-row">
                <span>Date</span>
                <strong>{bookingSuccess.date}</strong>
              </div>
            </div>

            <p className="success-message">📞 You will receive a confirmation call shortly. Reports will be sent to your phone/email.</p>

            <button className="done-btn" onClick={() => setBookingSuccess(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabTests

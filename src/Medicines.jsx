import { useState, useEffect, useRef } from 'react'
import './Medicines.css'

/* ─── Data ─────────────────────────────────────────── */
const NEARBY_PHARMACIES = [
  { id: 1, name: 'Apollo Pharmacy', address: 'MG Road, Near Metro Station', distance: '0.5 km', rating: 4.5, reviews: 230, open: true, deliveryTime: '15 min', discount: '10% OFF', express: true, image: '🏥', totalProducts: 8 },
  { id: 2, name: 'MedPlus Pharmacy', address: 'Central Market, Block B', distance: '0.8 km', rating: 4.3, reviews: 180, open: true, deliveryTime: '20 min', discount: '5% OFF', express: false, image: '💊', totalProducts: 8 },
  { id: 3, name: 'Wellness Forever', address: 'Sector 15, Main Road', distance: '1.2 km', rating: 4.6, reviews: 420, open: true, deliveryTime: '25 min', discount: null, express: true, image: '🩺', totalProducts: 8 },
  { id: 4, name: 'Fortune Pharmacy', address: 'Lake Road, Near Park', distance: '1.5 km', rating: 4.2, reviews: 95, open: false, deliveryTime: '30 min', discount: '15% OFF', express: false, image: '🏪', totalProducts: 8 },
  { id: 5, name: 'City Medical Store', address: 'Railway Station Road', distance: '2.0 km', rating: 4.4, reviews: 156, open: true, deliveryTime: '25 min', discount: null, express: false, image: '💉', totalProducts: 8 },
]

const STORE_INVENTORY = {
  1: [
    { id: 101, name: 'Corex Cough Syrup', category: 'Cold & Cough', subtitle: '100 ml', price: 89, mrp: 110, discount: 19, rating: 4.3, reviews: 156, icon: '🫁', inStock: true },
    { id: 102, name: 'Combiflam Tablets', category: 'Pain Relief', subtitle: '20 Tablets', price: 42, mrp: 55, discount: 24, rating: 4.6, reviews: 890, icon: '💊', inStock: true },
    { id: 103, name: 'Augmentin 625', category: 'Antibiotics', subtitle: '10 Tablets', price: 189, mrp: 245, discount: 23, rating: 4.5, reviews: 340, icon: '💊', inStock: true },
    { id: 104, name: 'Benadryl Cough', category: 'Cold & Cough', subtitle: '100 ml', price: 95, mrp: 120, discount: 21, rating: 4.2, reviews: 210, icon: '🫁', inStock: true },
    { id: 105, name: 'Volini Spray', category: 'Pain Relief', subtitle: '80 gm', price: 149, mrp: 195, discount: 24, rating: 4.4, reviews: 567, icon: '💪', inStock: true },
    { id: 106, name: 'Teldac CG', category: 'Digestion', subtitle: '200 ml', price: 79, mrp: 100, discount: 21, rating: 4.1, reviews: 123, icon: '🧪', inStock: false },
    { id: 107, name: 'Otrivin Nasal', category: 'Cold & Cough', subtitle: '10 ml', price: 45, mrp: 55, discount: 18, rating: 4.5, reviews: 445, icon: '👃', inStock: true },
    { id: 108, name: 'Himalaya Baby Care', category: 'Baby Care', subtitle: '200 ml', price: 199, mrp: 250, discount: 20, rating: 4.7, reviews: 234, icon: '👶', inStock: true },
  ],
  2: [
    { id: 201, name: 'Paracetamol 500', category: 'Pain Relief', subtitle: '10 Tablets', price: 15, mrp: 20, discount: 25, rating: 4.7, reviews: 2500, icon: '💊', inStock: true },
    { id: 202, name: 'Azithromycin 500', category: 'Antibiotics', subtitle: '6 Tablets', price: 89, mrp: 120, discount: 26, rating: 4.4, reviews: 189, icon: '💊', inStock: true },
    { id: 203, name: 'Omez Capsule', category: 'Digestion', subtitle: '14 Capsules', price: 69, mrp: 90, discount: 23, rating: 4.3, reviews: 345, icon: '🧪', inStock: true },
    { id: 204, name: 'Saridon', category: 'Pain Relief', subtitle: '10 Tablets', price: 25, mrp: 35, discount: 29, rating: 4.5, reviews: 678, icon: '💊', inStock: true },
    { id: 205, name: 'Digene Gel', category: 'Digestion', subtitle: '200 ml', price: 89, mrp: 115, discount: 23, rating: 4.2, reviews: 234, icon: '🧪', inStock: true },
    { id: 206, name: 'Crocin DS', category: 'Pain Relief', subtitle: '60 ml', price: 45, mrp: 55, discount: 18, rating: 4.6, reviews: 890, icon: '🧪', inStock: true },
    { id: 207, name: 'Moov Spray', category: 'Pain Relief', subtitle: '50 gm', price: 129, mrp: 165, discount: 22, rating: 4.4, reviews: 456, icon: '💪', inStock: true },
    { id: 208, name: 'ORS Powder', category: 'Digestion', subtitle: '8 Sachets', price: 35, mrp: 45, discount: 22, rating: 4.3, reviews: 167, icon: '🧪', inStock: false },
  ],
  3: [
    { id: 301, name: 'Disprin Tablets', category: 'Pain Relief', subtitle: '10 Tablets', price: 20, mrp: 25, discount: 20, rating: 4.6, reviews: 1200, icon: '💊', inStock: true },
    { id: 302, name: 'Cetirizine 10mg', category: 'Allergy', subtitle: '10 Tablets', price: 25, mrp: 35, discount: 29, rating: 4.5, reviews: 890, icon: '💊', inStock: true },
    { id: 303, name: 'D Rotacaps', category: 'Respiratory', subtitle: '30 Capsules', price: 189, mrp: 245, discount: 23, rating: 4.4, reviews: 234, icon: '🫁', inStock: true },
    { id: 304, name: 'Wincoryl Gargle', category: 'Cold & Cough', subtitle: '100 ml', price: 69, mrp: 90, discount: 23, rating: 4.3, reviews: 345, icon: '🫁', inStock: true },
    { id: 305, name: 'Becosules', category: 'Vitamins', subtitle: '20 Capsules', price: 55, mrp: 70, discount: 21, rating: 4.7, reviews: 567, icon: '💊', inStock: true },
    { id: 306, name: 'Gelusil Syrup', category: 'Digestion', subtitle: '200 ml', price: 79, mrp: 100, discount: 21, rating: 4.4, reviews: 456, icon: '🧪', inStock: true },
    { id: 307, name: 'Chyawanprash', category: 'Ayurveda', subtitle: '500 gm', price: 299, mrp: 399, discount: 25, rating: 4.6, reviews: 189, icon: '🌿', inStock: true },
    { id: 308, name: 'Betadine Gargle', category: 'Cold & Cough', subtitle: '100 ml', price: 89, mrp: 115, discount: 23, rating: 4.5, reviews: 278, icon: '🫁', inStock: true },
  ],
  4: [
    { id: 401, name: 'Pan D Capsule', category: 'Digestion', subtitle: '14 Capsules', price: 129, mrp: 170, discount: 24, rating: 4.4, reviews: 345, icon: '🧪', inStock: true },
    { id: 402, name: 'Rantac 150', category: 'Digestion', subtitle: '30 Tablets', price: 35, mrp: 45, discount: 22, rating: 4.5, reviews: 678, icon: '💊', inStock: true },
    { id: 403, name: 'Montair FX', category: 'Allergy', subtitle: '10 Tablets', price: 89, mrp: 120, discount: 26, rating: 4.3, reviews: 234, icon: '💊', inStock: false },
    { id: 404, name: 'OKit Solution', category: 'Baby Care', subtitle: '50 ml', price: 149, mrp: 195, discount: 24, rating: 4.6, reviews: 189, icon: '👶', inStock: true },
    { id: 405, name: 'Nurokind Plus', category: 'Vitamins', subtitle: '10 Tablets', price: 129, mrp: 170, discount: 24, rating: 4.5, reviews: 345, icon: '💊', inStock: true },
    { id: 406, name: 'Meftal Spas', category: 'Pain Relief', subtitle: '10 Tablets', price: 45, mrp: 60, discount: 25, rating: 4.4, reviews: 567, icon: '💊', inStock: true },
    { id: 407, name: 'Zincovit', category: 'Vitamins', subtitle: '15 Tablets', price: 89, mrp: 115, discount: 23, rating: 4.6, reviews: 456, icon: '💊', inStock: true },
    { id: 408, name: 'El-Torn Gel', category: 'Pain Relief', subtitle: '30 gm', price: 119, mrp: 155, discount: 23, rating: 4.3, reviews: 234, icon: '💪', inStock: true },
  ],
  5: [
    { id: 501, name: 'Aspirin 75', category: 'Heart Care', subtitle: '14 Tablets', price: 25, mrp: 35, discount: 29, rating: 4.6, reviews: 567, icon: '❤️', inStock: true },
    { id: 502, name: 'Atorva 10', category: 'Heart Care', subtitle: '10 Tablets', price: 149, mrp: 195, discount: 24, rating: 4.5, reviews: 345, icon: '❤️', inStock: true },
    { id: 503, name: 'Eye Drop Systane', category: 'Eye Care', subtitle: '10 ml', price: 299, mrp: 399, discount: 25, rating: 4.7, reviews: 189, icon: '👁️', inStock: true },
    { id: 504, name: 'Refresh Tears', category: 'Eye Care', subtitle: '10 ml', price: 249, mrp: 320, discount: 22, rating: 4.6, reviews: 234, icon: '👁️', inStock: true },
    { id: 505, name: 'Eye Multi', category: 'Eye Care', subtitle: '10 ml', price: 189, mrp: 245, discount: 23, rating: 4.4, reviews: 167, icon: '👁️', inStock: false },
    { id: 506, name: 'Colgate Sensitive', category: 'Dental', subtitle: '75 gm', price: 149, mrp: 195, discount: 24, rating: 4.5, reviews: 456, icon: '🦷', inStock: true },
    { id: 507, name: 'Listerine', category: 'Dental', subtitle: '250 ml', price: 199, mrp: 259, discount: 23, rating: 4.6, reviews: 345, icon: '🦷', inStock: true },
    { id: 508, name: 'Toothache Drop', category: 'Dental', subtitle: '10 ml', price: 79, mrp: 100, discount: 21, rating: 4.3, reviews: 123, icon: '🦷', inStock: true },
  ],
}

const ALL_MEDICINES = [
  { id: 1, name: 'Unienzyme Digestive', category: 'Digestion', subtitle: '200 ml', price: 119, mrp: 159, discount: 25, rating: 4.2, reviews: 107, icon: '🧪', brand: 'Mankind' },
  { id: 2, name: 'Clocip Anti-Fungal', category: 'Skin Care', subtitle: '100 gm', price: 93, mrp: 131, discount: 29, rating: 4.1, reviews: 89, icon: '🧴', brand: 'Cipla' },
  { id: 3, name: 'Cofsils Gargle', category: 'Cold & Cough', subtitle: '100 ml', price: 77, mrp: 159, discount: 51, rating: 4.4, reviews: 211, icon: '🫁', brand: 'Cipla' },
  { id: 4, name: 'Omnigel Pain Relief', category: 'Pain Relief', subtitle: '100 gm', price: 199, mrp: 314, discount: 37, rating: 4.5, reviews: 3565, icon: '💊', brand: 'GSK' },
  { id: 5, name: 'Aloe Vera Gel', category: 'Skin Care', subtitle: '100 gm', price: 107, mrp: 150, discount: 29, rating: 4.5, reviews: 6, icon: '🧴', brand: 'Himalaya' },
  { id: 6, name: 'Prega News Kit', category: 'Baby Care', subtitle: '1 Kit', price: 63, mrp: 112, discount: 44, rating: 3.9, reviews: 315, icon: '🧪', brand: 'Mankind' },
  { id: 7, name: 'Neurobion Forte', category: 'Vitamins', subtitle: '30 Tablets', price: 45, mrp: 60, discount: 25, rating: 4.6, reviews: 2340, icon: '💊', brand: 'Merck' },
  { id: 8, name: 'Dolo 650', category: 'Pain Relief', subtitle: '15 Tablets', price: 35, mrp: 45, discount: 22, rating: 4.7, reviews: 8900, icon: '💊', brand: 'Micro' },
  { id: 9, name: 'Allegra 120mg', category: 'Allergy', subtitle: '10 Tablets', price: 189, mrp: 245, discount: 23, rating: 4.4, reviews: 1560, icon: '💊', brand: 'Sanofi' },
  { id: 10, name: 'Sunscreen SPF50', category: 'Skin Care', subtitle: '50 gm', price: 399, mrp: 550, discount: 27, rating: 4.3, reviews: 890, icon: '☀️', brand: 'Lotus' },
  { id: 11, name: 'Revital H', category: 'Nutrition', subtitle: '60 Capsules', price: 399, mrp: 499, discount: 20, rating: 4.5, reviews: 4500, icon: '💪', brand: 'Sun Pharma' },
  { id: 12, name: 'Crocin 500', category: 'Pain Relief', subtitle: '20 Tablets', price: 30, mrp: 40, discount: 25, rating: 4.6, reviews: 12000, icon: '💊', brand: 'GSK' },
]

const FLASH_DEALS = [
  { id: 'f1', name: 'Dolo 650', subtitle: '15 Tabs', price: 35, mrp: 45, discount: 40, icon: '💊', brand: 'Micro', stock: 12 },
  { id: 'f2', name: 'Allegra 120mg', subtitle: '10 Tabs', price: 149, mrp: 245, discount: 39, icon: '💊', brand: 'Sanofi', stock: 5 },
  { id: 'f3', name: 'Neurobion Forte', subtitle: '30 Tabs', price: 38, mrp: 60, discount: 37, icon: '💊', brand: 'Merck', stock: 20 },
  { id: 'f4', name: 'Volini Spray', subtitle: '80 gm', price: 119, mrp: 195, discount: 39, icon: '💪', brand: 'Ranbaxy', stock: 8 },
]

const BRANDS = [
  { name: 'Himalaya', icon: '🌿', count: 45, color: '#16a34a' },
  { name: 'Cipla', icon: '💉', count: 120, color: '#2563eb' },
  { name: 'Sun Pharma', icon: '☀️', count: 89, color: '#d97706' },
  { name: 'Mankind', icon: '🧬', count: 67, color: '#7c3aed' },
  { name: 'Dr. Reddy', icon: '🏥', count: 54, color: '#dc2626' },
  { name: 'GSK', icon: '💊', count: 38, color: '#0891b2' },
  { name: 'Micro', icon: '➕', count: 72, color: '#059669' },
  { name: 'Merck', icon: '🔬', count: 41, color: '#9333ea' },
  { name: 'Sanofi', icon: '🏭', count: 56, color: '#be185d' },
  { name: 'Lotus', icon: '🌸', count: 33, color: '#e11d48' },
  { name: 'Dabur', icon: '🌱', count: 28, color: '#15803d' },
  { name: 'Morepen', icon: '🔺', count: 22, color: '#b45309' },
]

const CATEGORIES = [
  { name: 'All', icon: '💊', color: '#6366f1' },
  { name: 'Pain Relief', icon: '💪', color: '#ef4444' },
  { name: 'Vitamins', icon: '🌟', color: '#f59e0b' },
  { name: 'Digestion', icon: '🧪', color: '#10b981' },
  { name: 'Cold & Cough', icon: '🫁', color: '#3b82f6' },
  { name: 'Skin Care', icon: '🧴', color: '#ec4899' },
  { name: 'Allergy', icon: '💊', color: '#8b5cf6' },
  { name: 'Baby Care', icon: '👶', color: '#f97316' },
  { name: 'Nutrition', icon: '🥤', color: '#14b8a6' },
  { name: 'Heart Care', icon: '❤️', color: '#dc2626' },
  { name: 'Eye Care', icon: '👁️', color: '#0ea5e9' },
  { name: 'Dental', icon: '🦷', color: '#84cc16' },
]

const PERSONAL_CARE = [
  { id: 1, name: 'Head & Shoulders', category: 'Hair Care', icon: '🧴', price: 199, mrp: 249, off: '20%' },
  { id: 2, name: 'Dove Soap', category: 'Personal Care', icon: '🧼', price: 45, mrp: 50, off: '10%' },
  { id: 3, name: 'Colgate Toothpaste', category: 'Dental', icon: '🪥', price: 99, mrp: 120, off: '18%' },
  { id: 4, name: 'Nivea Body Lotion', category: 'Skin Care', icon: '🧴', price: 249, mrp: 320, off: '22%' },
  { id: 5, name: 'Himalaya Face Wash', category: 'Skin Care', icon: '🧼', price: 159, mrp: 195, off: '18%' },
  { id: 6, name: 'AXE Deodorant', category: 'Personal Care', icon: '🧴', price: 199, mrp: 250, off: '20%' },
  { id: 7, name: 'Parachute Hair Oil', category: 'Hair Care', icon: '🪮', price: 179, mrp: 220, off: '18%' },
  { id: 8, name: 'Dettol Hand Wash', category: 'Personal Care', icon: '🧼', price: 89, mrp: 110, off: '19%' },
  { id: 9, name: 'Gillette Razor', category: 'Personal Care', icon: '🪒', price: 129, mrp: 160, off: '19%' },
  { id: 10, name: 'Vaseline Lip Balm', category: 'Lip Care', icon: '💄', price: 59, mrp: 75, off: '21%' },
]

const BANNERS = [
  { id: 1, tag: '🔥 LIMITED OFFER', title: 'Get 25% OFF', sub: 'On First Order + Free Delivery', btn: 'Order Now', icon: '💊', gradient: 'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)' },
  { id: 2, tag: '⚡ EXPRESS', title: 'Delivered in 15 Min', sub: 'Medicines at your doorstep fast', btn: 'Try Now', icon: '🚀', gradient: 'linear-gradient(135deg,#6d28d9 0%,#a855f7 100%)' },
  { id: 3, tag: '🌟 SALE', title: 'Up to 40% OFF', sub: 'On Vitamins & Nutrition brands', btn: 'Shop Now', icon: '💪', gradient: 'linear-gradient(135deg,#047857 0%,#10b981 100%)' },
]

/* ─── Star Rating ───────────────────────────── */
function Stars({ rating }) {
  return (
    <span className="m-stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>
      ))}
    </span>
  )
}

/* ─── Countdown Timer ──────────────────────── */
function Countdown({ seconds }) {
  const [time, setTime] = useState(seconds)
  useEffect(() => {
    const t = setInterval(() => setTime(p => p > 0 ? p - 1 : seconds), 1000)
    return () => clearInterval(t)
  }, [seconds])
  const h = String(Math.floor(time / 3600)).padStart(2, '0')
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0')
  const s = String(time % 60).padStart(2, '0')
  return (
    <div className="m-countdown">
      <span className="m-cd-label">Ends in</span>
      {[h, m, s].map((v, i) => (
        <span key={i}><span className="m-cd-block">{v}</span>{i < 2 && <span className="m-cd-sep">:</span>}</span>
      ))}
    </div>
  )
}

/* ─── Main Component ─────────────────────────── */
function Medicines() {
  const [screen, setScreen] = useState('home')
  const [cart, setCart] = useState([])
  const [locationName, setLocationName] = useState('Mumbai, IN')
  const [locationLoading, setLocationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeSearch, setStoreSearch] = useState('')
  const [storeCategory, setStoreCategory] = useState('All')
  const [bannerIdx, setBannerIdx] = useState(0)
  const [bannerAnimating, setBannerAnimating] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [prescriptionScreen, setPrescriptionScreen] = useState(false)
  const [prescriptionFiles, setPrescriptionFiles] = useState([])
  const [prescriptionNote, setPrescriptionNote] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const [pharmacyScreen, setPharmacyScreen] = useState(false)
  const [pharmacyFilter, setPharmacyFilter] = useState('all')
  const [pharmacySort, setPharmacySort] = useState('distance')
  const [pharmacySearch, setPharmacySearch] = useState('')

  /* auto-rotate banner with animation */
  useEffect(() => {
    const t = setInterval(() => {
      setBannerAnimating(true)
      setTimeout(() => {
        setBannerIdx(i => (i + 1) % BANNERS.length)
        setBannerAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  /* cart helpers */
  const addToCart = item => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id)
      return ex ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }]
    })
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 400)
  }
  const removeFromCart = id => setCart(prev => {
    const ex = prev.find(i => i.id === id)
    if (!ex) return prev
    return ex.qty > 1 ? prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
      : prev.filter(i => i.id !== id)
  })
  const getQty = id => cart.find(i => i.id === id)?.qty || 0
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  /* wishlist */
  const toggleWishlist = id => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  /* prescription upload */
  const handlePrescriptionUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      file, name: file.name,
      preview: URL.createObjectURL(file),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }))
    setPrescriptionFiles(prev => [...prev, ...newFiles])
  }
  const removePrescriptionFile = (index) => {
    setPrescriptionFiles(prev => prev.filter((_, i) => i !== index))
  }
  const submitPrescription = () => {
    if (prescriptionFiles.length === 0) return
    setUploadSuccess(true)
    setTimeout(() => {
      setPrescriptionScreen(false)
      setPrescriptionFiles([])
      setPrescriptionNote('')
      setUploadSuccess(false)
    }, 2000)
  }

  /* filtered pharmacies */
  const getFilteredPharmacies = () => {
    let list = [...NEARBY_PHARMACIES]
    
    if (pharmacySearch) {
      const q = pharmacySearch.toLowerCase()
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.address.toLowerCase().includes(q)
      )
    }
    
    if (pharmacyFilter === 'open') {
      list = list.filter(p => p.open)
    } else if (pharmacyFilter === 'express') {
      list = list.filter(p => p.express)
    } else if (pharmacyFilter === 'discount') {
      list = list.filter(p => p.discount)
    }
    
    if (pharmacySort === 'distance') {
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    } else if (pharmacySort === 'rating') {
      list.sort((a, b) => b.rating - a.rating)
    } else if (pharmacySort === 'delivery') {
      list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
    }
    
    return list
  }

  /* location */
  const detectLocation = () => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      () => { setLocationName('Your Location'); setLocationLoading(false) },
      () => setLocationLoading(false)
    )
  }

  /* filtered medicines */
  const filteredMedicines = (() => {
    let list = ALL_MEDICINES.filter(m => {
      const q = searchQuery.toLowerCase()
      return (m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)) &&
        (selectedCategory === 'All' || m.category === selectedCategory)
    })
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'discount') list = [...list].sort((a, b) => b.discount - a.discount)
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  })()

  /* ─── UPLOAD PRESCRIPTION SCREEN ─── */
  if (prescriptionScreen) {
    return (
      <div className="m-page">
        <div className="m-cart-header">
          <button className="m-back-btn" onClick={() => setPrescriptionScreen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <h1>Upload Prescription</h1>
        </div>
        <div className="m-prescription-body">
          {uploadSuccess ? (
            <div className="m-prescription-success">
              <div className="m-success-icon">✓</div>
              <h2>Prescription Submitted!</h2>
              <p>Our pharmacist will review and contact you within 15 minutes</p>
            </div>
          ) : (
            <>
              <div className="m-prescription-info">
                <div className="m-presc-icon">📋</div>
                <h3>Upload Your Prescription</h3>
                <p>Get medicines delivered by uploading a valid prescription from your doctor</p>
              </div>
              <div className="m-upload-zone">
                <input type="file" id="prescription-upload" accept="image/*,.pdf" multiple onChange={handlePrescriptionUpload} className="m-upload-input" />
                <label htmlFor="prescription-upload" className="m-upload-label">
                  <div className="m-upload-icon">📷</div>
                  <span className="m-upload-text">Tap to upload prescription</span>
                  <span className="m-upload-sub">PNG, JPG, PDF (Max 10MB each)</span>
                </label>
              </div>
              {prescriptionFiles.length > 0 && (
                <div className="m-uploaded-files">
                  <h4>Uploaded Files ({prescriptionFiles.length})</h4>
                  {prescriptionFiles.map((file, idx) => (
                    <div key={idx} className="m-file-item">
                      {file.file.type.startsWith('image/') ? (
                        <img src={file.preview} alt={file.name} className="m-file-preview" />
                      ) : (
                        <div className="m-file-icon">📄</div>
                      )}
                      <div className="m-file-info">
                        <span className="m-file-name">{file.name}</span>
                        <span className="m-file-size">{file.size}</span>
                      </div>
                      <button className="m-file-remove" onClick={() => removePrescriptionFile(idx)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="m-presc-note">
                <label>Additional Note (Optional)</label>
                <textarea placeholder="Add any special instructions..." value={prescriptionNote} onChange={(e) => setPrescriptionNote(e.target.value)} rows={3} />
              </div>
              <div className="m-presc-tips">
                <h4>💡 Tips for clear prescription photo:</h4>
                <ul>
                  <li>Ensure good lighting</li>
                  <li>Keep the prescription flat</li>
                  <li>Make sure all text is readable</li>
                  <li>Include doctor signature if visible</li>
                </ul>
              </div>
              <button className="m-presc-submit-btn" onClick={submitPrescription} disabled={prescriptionFiles.length === 0}>
                Submit Prescription
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  /* ─── PHARMACY SCREEN ─────────────────────────── */
  if (pharmacyScreen) {
    const filteredPharmacies = getFilteredPharmacies()
    const openCount = NEARBY_PHARMACIES.filter(p => p.open).length
    
    return (
      <div className="m-page">
        <div className="m-pharmacy-header">
          <button className="m-back-btn" onClick={() => setPharmacyScreen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <h1>Medical Stores</h1>
          <span className="m-open-count">{openCount} Open</span>
        </div>

        <div className="m-pharmacy-search-wrap">
          <div className="m-search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="text"
              placeholder="Search stores..."
              value={pharmacySearch}
              onChange={e => setPharmacySearch(e.target.value)}
            />
            {pharmacySearch && <button className="m-clear" onClick={() => setPharmacySearch('')}>✕</button>}
          </div>
        </div>

        <div className="m-pharmacy-filters">
          <button 
            className={`m-pharm-filter-btn ${pharmacyFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPharmacyFilter('all')}
          >
            All ({NEARBY_PHARMACIES.length})
          </button>
          <button 
            className={`m-pharm-filter-btn ${pharmacyFilter === 'open' ? 'active' : ''}`}
            onClick={() => setPharmacyFilter('open')}
          >
            Open Now
          </button>
          <button 
            className={`m-pharm-filter-btn ${pharmacyFilter === 'express' ? 'active' : ''}`}
            onClick={() => setPharmacyFilter('express')}
          >
            ⚡ Express
          </button>
          <button 
            className={`m-pharm-filter-btn ${pharmacyFilter === 'discount' ? 'active' : ''}`}
            onClick={() => setPharmacyFilter('discount')}
          >
            🎉 Discount
          </button>
        </div>

        <div className="m-pharmacy-sort">
          <span className="m-sort-label">Sort by:</span>
          <select value={pharmacySort} onChange={e => setPharmacySort(e.target.value)}>
            <option value="distance">🚶 Nearest</option>
            <option value="rating">⭐ Best Rated</option>
            <option value="delivery">🚚 Fastest Delivery</option>
          </select>
        </div>

        <div className="m-pharmacies-list">
          {filteredPharmacies.length === 0 ? (
            <div className="m-empty-state">
              <span>🏪</span>
              <p>No stores found</p>
            </div>
          ) : (
            filteredPharmacies.map(store => (
              <div
                key={store.id}
                className={`m-pharmacy-card-full ${!store.open ? 'closed-store' : ''}`}
                onClick={() => { if (store.open) { setSelectedStore(store); setScreen('store'); setPharmacyScreen(false) } }}
              >
                <div className="m-pharmacy-img-full">
                  <span className="m-pharmacy-emoji">{store.image}</span>
                  {!store.open && <div className="m-closed-overlay-full">Closed</div>}
                </div>
                <div className="m-pharmacy-info-full">
                  <div className="m-pharmacy-top-full">
                    <h3>{store.name}</h3>
                    <span className={`m-status-badge ${store.open ? 'open' : 'closed'}`}>
                      {store.open ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  </div>
                  <p className="m-pharmacy-addr-full">📍 {store.address}</p>
                  <div className="m-pharmacy-meta-full">
                    <span className="m-meta-item">📍 {store.distance}</span>
                    <span className="m-meta-item">⭐ {store.rating}</span>
                    <span className="m-meta-item">🗣️ {store.reviews}+</span>
                    <span className="m-meta-item">🚚 {store.deliveryTime}</span>
                  </div>
                  <div className="m-pharmacy-badges-full">
                    {store.discount && <span className="m-badge-full discount">{store.discount}</span>}
                    {store.express && <span className="m-badge-full express">⚡ Express</span>}
                    <span className="m-badge-full items">{store.totalProducts} Products</span>
                  </div>
                </div>
                {store.open && (
                  <div className="m-pharmacy-arrow-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  /* ─── CART SCREEN ─── */
  if (screen === 'cart') {
    const savings = cart.reduce((s, i) => s + (i.mrp - i.price) * i.qty, 0)
    return (
      <div className="m-page">
        <div className="m-cart-header">
          <button className="m-back-btn" onClick={() => setScreen('home')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <h1>My Cart</h1>
          <span className="m-cart-count-pill">{cartCount}</span>
        </div>
        <div className="m-cart-body">
          {cart.length === 0 ? (
            <div className="m-empty-cart">
              <div className="m-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add medicines and healthcare products to get started</p>
              <button className="m-primary-btn" onClick={() => setScreen('home')}>Browse Medicines</button>
            </div>
          ) : (
            <>
              <div className="m-cart-list">
                {cart.map(item => (
                  <div key={item.id} className="m-cart-item">
                    <div className="m-cart-item-img">{item.icon}</div>
                    <div className="m-cart-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.subtitle}</p>
                      <div className="m-cart-item-prices">
                        <span className="m-price">₹{item.price}</span>
                        {item.mrp && <span className="m-mrp">₹{item.mrp}</span>}
                        {item.discount && <span className="m-off-badge">{item.discount}% OFF</span>}
                      </div>
                    </div>
                    <div className="m-qty-ctrl">
                      <button onClick={() => removeFromCart(item.id)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="m-cart-summary">
                <h3>Bill Summary</h3>
                <div className="m-summary-row"><span>MRP Total</span><span>₹{cart.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0)}</span></div>
                <div className="m-summary-row green"><span>Discount</span><span>−₹{savings.toFixed(0)}</span></div>
                <div className="m-summary-row"><span>Delivery</span><span className="m-free">FREE</span></div>
                <div className="m-summary-divider" />
                <div className="m-summary-row bold"><span>Total Payable</span><span>₹{cartTotal}</span></div>
              </div>
              <div className="m-cart-footer-block">
                {savings > 0 && <div className="m-savings-pill">🎉 You save ₹{savings.toFixed(0)} on this order!</div>}
                <button className="m-checkout-btn">
                  Proceed to Checkout &nbsp;·&nbsp; ₹{cartTotal}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  /* ─── STORE SCREEN ─── */
  if (screen === 'store' && selectedStore) {
    const storeProducts = STORE_INVENTORY[selectedStore.id] || []
    const cats = ['All', ...new Set(storeProducts.map(p => p.category))]
    const filtered = storeProducts.filter(p => {
      return p.name.toLowerCase().includes(storeSearch.toLowerCase()) &&
        (storeCategory === 'All' || p.category === storeCategory)
    })
    return (
      <div className="m-page">
        <div className="m-store-hero">
          <button className="m-store-back" onClick={() => { setScreen('home'); setStoreCategory('All'); setStoreSearch('') }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div className="m-store-hero-content">
            <div className="m-store-avatar">{selectedStore.image}</div>
            <div className="m-store-hero-info">
              <h1>{selectedStore.name}</h1>
              <p>📍 {selectedStore.address}</p>
              <div className="m-store-tags">
                <span className={`m-status-tag ${selectedStore.open ? 'open' : 'closed'}`}>
                  {selectedStore.open ? '● Open' : '○ Closed'}
                </span>
                {selectedStore.express && <span className="m-express-tag">⚡ Express</span>}
                {selectedStore.discount && <span className="m-discount-tag">{selectedStore.discount}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="m-store-stats-bar">
          <div className="m-stat"><span className="m-stat-val">⭐ {selectedStore.rating}</span><span className="m-stat-lbl">{selectedStore.reviews}+ Reviews</span></div>
          <div className="m-stat-div" />
          <div className="m-stat"><span className="m-stat-val">🚚 {selectedStore.deliveryTime}</span><span className="m-stat-lbl">Delivery</span></div>
          <div className="m-stat-div" />
          <div className="m-stat"><span className="m-stat-val">📦 {storeProducts.length}</span><span className="m-stat-lbl">Products</span></div>
          <div className="m-stat-div" />
          <div className="m-stat"><span className="m-stat-val">📍 {selectedStore.distance}</span><span className="m-stat-lbl">Away</span></div>
        </div>
        <div className="m-store-top">
          <div className="m-search-bar store-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input placeholder="Search in this store..." value={storeSearch} onChange={e => setStoreSearch(e.target.value)} />
            {storeSearch && <button className="m-clear" onClick={() => setStoreSearch('')}>✕</button>}
          </div>
          <div className="m-cats-scroll">
            {cats.map(c => (
              <button key={c} className={`m-cat-chip ${storeCategory === c ? 'active' : ''}`} onClick={() => setStoreCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="m-store-products-wrap">
          <div className="m-section-hdr">
            <h2>{storeCategory === 'All' ? 'All Products' : storeCategory}</h2>
            <span className="m-count-badge">{filtered.length} items</span>
          </div>
          {filtered.length === 0 ? (
            <div className="m-empty-state"><span>📦</span><p>No products found</p></div>
          ) : (
            <div className="m-products-grid">
              {filtered.map(p => {
                const qty = getQty(p.id)
                return (
                  <div key={p.id} className="m-product-card">
                    {p.discount >= 25 && <span className="m-bestseller">Best Seller</span>}
                    <div className="m-product-img-box">{p.icon}</div>
                    <span className="m-cat-label">{p.category}</span>
                    <h4 className="m-product-name">{p.name}</h4>
                    <p className="m-product-sub">{p.subtitle}</p>
                    <div className="m-product-rating">
                      <Stars rating={p.rating} />
                      <span className="m-rev-count">({p.reviews})</span>
                    </div>
                    <div className="m-price-row">
                      <span className="m-price">₹{p.price}</span>
                      <span className="m-mrp">₹{p.mrp}</span>
                      <span className="m-off-badge">{p.discount}% OFF</span>
                    </div>
                    {!p.inStock ? (
                      <button className="m-oos-btn">Out of Stock</button>
                    ) : qty > 0 ? (
                      <div className="m-qty-box">
                        <button onClick={() => removeFromCart(p.id)}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => addToCart(p)}>+</button>
                      </div>
                    ) : (
                      <button className="m-add-btn" onClick={() => addToCart(p)}>
                        <span>ADD</span>
                        <span className="m-add-price">₹{p.price}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {cartCount > 0 && (
          <div className="m-float-cart" onClick={() => setScreen('cart')}>
            <div className="m-fc-left">
              <span className="m-fc-badge">{cartCount}</span>
              <span className="m-fc-label">items in cart</span>
            </div>
            <div className="m-fc-right">
              <span>₹{cartTotal}</span>
              <span>View Cart →</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ─── HOME SCREEN ─── */
  return (
    <div className="m-page" onClick={() => showSortMenu && setShowSortMenu(false)}>

      {/* ── Header ── */}
      <header className="m-header">
        <div className="m-header-top">
          <div className="m-logo">
            <div className="m-logo-icon">💊</div>
            <div>
              <h1 className="m-logo-title">MediQuick</h1>
              <p className="m-logo-sub">Medicines in minutes</p>
            </div>
          </div>
          <div className="m-header-actions">
            <button className="m-loc-btn" onClick={detectLocation}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
              {locationLoading ? 'Detecting…' : locationName}
            </button>
            <button className={`m-cart-icon-btn ${cartBounce ? 'bounce' : ''}`} onClick={() => setScreen('cart')}>
              🛒
              {cartCount > 0 && <span className="m-cart-dot">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="m-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            type="text"
            placeholder="Search medicines, brands..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button className="m-clear" onClick={() => setSearchQuery('')}>✕</button>}
        </div>

        {/* Upload Prescription */}
        <button className="m-upload-presc-btn" onClick={() => setPrescriptionScreen(true)}>
          <span className="m-presc-btn-icon">📤</span>
          <span>Upload Prescription</span>
          <span className="m-presc-btn-arrow">→</span>
        </button>
      </header>

      {searchQuery && (
        <div className="m-search-info">
          Showing <strong>{filteredMedicines.length}</strong> results for "<strong>{searchQuery}</strong>"
        </div>
      )}

      {/* ── Promo Banner Carousel ── */}
      <section className="m-banner-wrap">
        <div className={`m-banner ${bannerAnimating ? 'fading' : ''}`} style={{ background: BANNERS[bannerIdx].gradient }}>
          <div className="m-banner-circles" />
          <div className="m-banner-text">
            <span className="m-banner-tag">{BANNERS[bannerIdx].tag}</span>
            <h2>{BANNERS[bannerIdx].title}</h2>
            <p>{BANNERS[bannerIdx].sub}</p>
            <button className="m-banner-btn">{BANNERS[bannerIdx].btn} →</button>
          </div>
          <div className="m-banner-emoji">{BANNERS[bannerIdx].icon}</div>
        </div>
        <div className="m-banner-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`m-dot ${i === bannerIdx ? 'active' : ''}`} onClick={() => setBannerIdx(i)} />
          ))}
        </div>
      </section>

      {/* ── Quick Stats ── */}
      <div className="m-trust-strip">
        {[
          { icon: '🛡️', title: 'Verified', sub: 'Licensed Stores' },
          { icon: '💊', title: 'Genuine', sub: '100% Authentic' },
          { icon: '⚡', title: 'Express', sub: '15-min Delivery' },
          { icon: '🏷️', title: 'Best Price', sub: 'Guaranteed' },
        ].map((t, i) => (
          <div key={i} className="m-trust-item">
            <span>{t.icon}</span>
            <div><strong>{t.title}</strong><p>{t.sub}</p></div>
          </div>
        ))}
      </div>

      {/* ── Flash Deals ── */}
      <section className="m-section m-flash-section">
        <div className="m-flash-header">
          <div className="m-flash-title">
            <span className="m-flash-icon">⚡</span>
            <h2>Flash Deals</h2>
          </div>
          <Countdown seconds={3 * 3600 + 42 * 60 + 17} />
        </div>
        <div className="m-flash-scroll">
          {FLASH_DEALS.map(item => {
            const qty = getQty(item.id)
            return (
              <div key={item.id} className="m-flash-card">
                <div className="m-flash-badge">{item.discount}% OFF</div>
                <div className="m-flash-img">{item.icon}</div>
                <span className="m-flash-brand">{item.brand}</span>
                <h4 className="m-flash-name">{item.name}</h4>
                <p className="m-flash-sub">{item.subtitle}</p>
                <div className="m-flash-prices">
                  <span className="m-price">₹{item.price}</span>
                  <span className="m-mrp">₹{item.mrp}</span>
                </div>
                <div className="m-flash-stock">
                  <div className="m-stock-bar"><div className="m-stock-fill" style={{ width: `${(item.stock / 20) * 100}%` }} /></div>
                  <span>{item.stock} left</span>
                </div>
                {qty > 0 ? (
                  <div className="m-qty-box">
                    <button onClick={() => removeFromCart(item.id)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                ) : (
                  <button className="m-add-btn" onClick={() => addToCart(item)}>ADD</button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="m-section">
        <div className="m-section-hdr">
          <h2>Shop by Category</h2>
          <span className="m-see-all">See All →</span>
        </div>
        <div className="m-cats-grid-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              className={`m-cat-card ${selectedCategory === cat.name ? 'active' : ''}`}
              style={selectedCategory === cat.name
                ? { background: cat.color, borderColor: cat.color }
                : { '--cat-color': cat.color }}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span className="m-cat-icon">{cat.icon}</span>
              <span className="m-cat-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Brands ── */}
      <section className="m-section m-section-gray">
        <div className="m-section-hdr">
          <h2>Top Brands</h2>
          <span className="m-see-all">See All →</span>
        </div>
        <div className="m-brands-scroll">
          {BRANDS.map((b, i) => (
            <button key={i} className="m-brand-card" onClick={() => setSearchQuery(b.name)} style={{ '--brand-color': b.color }}>
              <div className="m-brand-icon-box" style={{ background: b.color + '18' }}>{b.icon}</div>
              <p className="m-brand-name">{b.name}</p>
              <p className="m-brand-count">{b.count}+ items</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Pharmacies Near You ── */}
      <section className="m-section">
        <div className="m-section-hdr">
          <h2>Medical Stores Near You</h2>
          <span className="m-see-all" onClick={() => setPharmacyScreen(true)}>See All →</span>
        </div>
        <p className="m-section-sub">📍 {NEARBY_PHARMACIES.filter(s => s.open).length} stores open near {locationName}</p>
        <div className="m-pharmacy-list">
          {NEARBY_PHARMACIES.map(store => (
            <div
              key={store.id}
              className={`m-pharmacy-card ${!store.open ? 'closed-store' : ''}`}
              onClick={() => { if (store.open) { setSelectedStore(store); setScreen('store') } }}
            >
              <div className="m-pharmacy-img">
                <span>{store.image}</span>
                {!store.open && <div className="m-closed-overlay">Closed</div>}
              </div>
              <div className="m-pharmacy-info">
                <div className="m-pharmacy-top">
                  <h3>{store.name}</h3>
                  <span className={`m-open-tag ${store.open ? 'open' : 'closed'}`}>
                    {store.open ? '● Open' : '○ Closed'}
                  </span>
                </div>
                <p className="m-pharmacy-addr">📍 {store.address}</p>
                <div className="m-pharmacy-meta">
                  <span>📍 {store.distance}</span>
                  <span>⭐ {store.rating} ({store.reviews})</span>
                  <span>🚚 {store.deliveryTime}</span>
                </div>
                <div className="m-pharmacy-badges">
                  {store.discount && <span className="m-badge discount">{store.discount}</span>}
                  {store.express && <span className="m-badge express">⚡ Express</span>}
                  <span className="m-badge items">{store.totalProducts} Products</span>
                </div>
              </div>
              {store.open && (
                <div className="m-pharmacy-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Medicines ── */}
      <section className="m-section m-section-gray">
        <div className="m-section-hdr">
          <h2>{selectedCategory === 'All' ? 'Popular Medicines' : selectedCategory}</h2>
          <div className="m-sort-wrap">
            <button className="m-sort-btn" onClick={e => { e.stopPropagation(); setShowSortMenu(v => !v) }}>
              ⇅ Sort
            </button>
            {showSortMenu && (
              <div className="m-sort-menu" onClick={e => e.stopPropagation()}>
                {[['default', 'Relevance'], ['price-asc', 'Price: Low → High'], ['price-desc', 'Price: High → Low'], ['discount', 'Best Discount'], ['rating', 'Top Rated']].map(([v, l]) => (
                  <button key={v} className={`m-sort-opt ${sortBy === v ? 'active' : ''}`} onClick={() => { setSortBy(v); setShowSortMenu(false) }}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="m-empty-state">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>🔍</span>
            <p style={{ color: '#64748b', marginBottom: 16 }}>No medicines found for "{searchQuery}"</p>
            <button className="m-primary-btn" onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}>Clear Filters</button>
          </div>
        ) : (
          <div className="m-meds-scroll">
            {filteredMedicines.map(med => {
              const qty = getQty(med.id)
              return (
                <div key={med.id} className="m-med-card">
                  <div className="m-med-actions">
                    <button className={`m-wish-btn ${wishlist.includes(med.id) ? 'wished' : ''}`} onClick={() => toggleWishlist(med.id)}>
                      {wishlist.includes(med.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  {med.discount >= 30 && <div className="m-hot-tag">🔥 Hot</div>}
                  <div className="m-med-img-box">{med.icon}</div>
                  <span className="m-brand-tag">{med.brand}</span>
                  <h4 className="m-med-name">{med.name}</h4>
                  <p className="m-med-sub">{med.subtitle}</p>
                  <div className="m-med-rating">
                    <Stars rating={med.rating} />
                    <span className="m-rev-count">({med.reviews.toLocaleString()})</span>
                  </div>
                  <div className="m-price-row">
                    <span className="m-price">₹{med.price}</span>
                    <span className="m-mrp">₹{med.mrp}</span>
                    <span className="m-off-badge">{med.discount}% OFF</span>
                  </div>
                  {qty > 0 ? (
                    <div className="m-qty-box">
                      <button onClick={() => removeFromCart(med.id)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => addToCart(med)}>+</button>
                    </div>
                  ) : (
                    <button className="m-add-btn" onClick={() => addToCart(med)}>
                      <span>ADD</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Personal Care ── */}
      <section className="m-section">
        <div className="m-section-hdr">
          <h2>Personal Care</h2>
          <span className="m-see-all">See All →</span>
        </div>
        <div className="m-pcare-grid-scroll">
          {PERSONAL_CARE.map(item => (
            <div key={item.id} className="m-pcare-card">
              <div className="m-pcare-img">{item.icon}</div>
              <span className="m-cat-label">{item.category}</span>
              <h4 className="m-pcare-name">{item.name}</h4>
              <div className="m-price-row">
                <span className="m-price">₹{item.price}</span>
                {item.off && <span className="m-off-badge">{item.off} OFF</span>}
              </div>
              <button className="m-add-btn" onClick={() => addToCart({ ...item, discount: parseInt(item.off || '0'), rating: 4.0, reviews: 0, subtitle: item.category })}>ADD</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Floating Cart ── */}
      {cartCount > 0 && (
        <div className="m-float-cart" onClick={() => setScreen('cart')}>
          <div className="m-fc-left">
            <span className="m-fc-badge">{cartCount}</span>
            <span className="m-fc-label">items in cart</span>
          </div>
          <div className="m-fc-right">
            <span className="m-fc-total">₹{cartTotal}</span>
            <span className="m-fc-cta">View Cart →</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medicines

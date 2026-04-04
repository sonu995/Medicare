const express = require('express')
const router = express.Router()
const Doctor = require('../models/Doctor')
const Clinic = require('../models/Clinic')
const Booking = require('../models/Booking')
const TokenState = require('../models/TokenState')

const DOCTORS_DATA = [
  {
    name: 'Dr. Sameer Shah', specialty: 'Cardiologist', experience: '15+ years experience',
    rating: '4.8 (120 Reviews)', location: 'South Mumbai', clinicName: 'Apollo Cardio Clinic',
    icon: '👨‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (Cardiology)', 'DM (Cardiology)'], education: 'Grant Medical College, Mumbai',
    bio: 'Dr. Sameer Shah is a renowned cardiologist with over 15 years of experience in treating heart conditions. He specializes in preventive cardiology, heart failure management, and interventional procedures.',
    achievements: ['Best Cardiologist Award 2023', '1000+ Successful Angioplasties', 'Published 25+ Research Papers'],
    languages: ['English', 'Hindi', 'Marathi'], fee: 800,
    schedule: {
      morning: { start: '09:00', end: '13:00', totalTokens: 30, tokenDuration: 10, active: true },
      evening: { start: '17:00', end: '21:00', totalTokens: 20, tokenDuration: 10, active: true }
    }
  },
  {
    name: 'Dr. Ananya Iyer', specialty: 'Dermatologist', experience: '10+ years experience',
    rating: '4.9 (85 Reviews)', location: 'Bandra West', clinicName: 'Skin & Health Clinic',
    icon: '👩‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'DDVL', 'Fellowship in Cosmetic Dermatology'], education: 'KEM Hospital, Mumbai',
    bio: 'Dr. Ananya Iyer is a leading dermatologist specializing in cosmetic dermatology, skin rejuvenation, and hair loss treatment.',
    achievements: ['Gold Medal in DDVL', 'Celebrity Skin Expert', '10000+ Satisfied Patients'],
    languages: ['English', 'Hindi', 'Tamil'], fee: 700,
    schedule: {
      morning: { start: '10:00', end: '13:00', totalTokens: 20, tokenDuration: 15, active: true },
      evening: { start: '18:00', end: '20:00', totalTokens: 15, tokenDuration: 15, active: false }
    }
  },
  {
    name: 'Dr. Rahul Verma', specialty: 'General Physician', experience: '12+ years experience',
    rating: '4.7 (210 Reviews)', location: 'Andheri East', clinicName: 'Max Healthcare Clinic',
    icon: '👨‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (General Medicine)'], education: 'Seth GS Medical College, Mumbai',
    bio: 'Dr. Rahul Verma is a trusted general physician with expertise in managing diabetes, hypertension, and common illnesses.',
    achievements: ['Best General Physician 2022', '15+ Years of Service', '5000+ Happy Patients'],
    languages: ['English', 'Hindi', 'Gujarati'], fee: 400,
    schedule: {
      morning: { start: '09:00', end: '12:00', totalTokens: 25, tokenDuration: 8, active: true },
      evening: { start: '16:00', end: '20:00', totalTokens: 25, tokenDuration: 8, active: true }
    }
  },
  {
    name: 'Dr. Rekha Pillai', specialty: 'General Physician', experience: '10+ years experience',
    rating: '4.7 (95 Reviews)', location: 'South Mumbai', clinicName: 'Apollo Cardio Clinic',
    icon: '👩‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (General Medicine)'], education: 'Grant Medical College',
    bio: 'Dr. Rekha Pillai is an experienced general physician.', achievements: [], languages: ['English', 'Hindi'], fee: 400,
    schedule: { morning: { start: '10:00', end: '13:00', totalTokens: 20, tokenDuration: 10, active: true }, evening: { start: '17:00', end: '20:00', totalTokens: 15, tokenDuration: 10, active: false } }
  },
  {
    name: 'Dr. Amit Bose', specialty: 'Cardiologist', experience: '8+ years experience',
    rating: '4.6 (60 Reviews)', location: 'South Mumbai', clinicName: 'Apollo Cardio Clinic',
    icon: '👨‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'DM (Cardiology)'], education: 'Medical College', bio: 'Dr. Amit Bose is a cardiologist.', achievements: [], languages: ['English', 'Hindi'], fee: 600,
    schedule: { morning: { start: '09:00', end: '12:00', totalTokens: 20, tokenDuration: 10, active: false }, evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: true } }
  },
  {
    name: 'Dr. Pooja Sharma', specialty: 'Cosmetologist', experience: '6+ years experience',
    rating: '4.8 (44 Reviews)', location: 'Bandra West', clinicName: 'Skin & Health Clinic',
    icon: '👩‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'Diploma in Cosmetology'], education: 'KEM Hospital', bio: 'Dr. Pooja Sharma is a cosmetologist.', achievements: [], languages: ['English', 'Hindi'], fee: 500,
    schedule: { morning: { start: '11:00', end: '14:00', totalTokens: 15, tokenDuration: 15, active: true }, evening: { start: '17:00', end: '20:00', totalTokens: 10, tokenDuration: 15, active: false } }
  },
  {
    name: 'Dr. Kiran Nair', specialty: 'Hair & Scalp Specialist', experience: '5+ years experience',
    rating: '4.7 (38 Reviews)', location: 'Bandra West', clinicName: 'Skin & Health Clinic',
    icon: '👨‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'Fellowship Hair Restoration'], education: 'Medical College', bio: 'Dr. Kiran Nair specializes in hair & scalp treatments.', achievements: [], languages: ['English', 'Malayalam'], fee: 600,
    schedule: { morning: { start: '09:00', end: '12:00', totalTokens: 15, tokenDuration: 15, active: false }, evening: { start: '16:00', end: '19:00', totalTokens: 12, tokenDuration: 15, active: true } }
  },
  {
    name: 'Dr. Sunita Gupta', specialty: 'Paediatrician', experience: '14+ years experience',
    rating: '4.8 (175 Reviews)', location: 'Andheri East', clinicName: 'Max Healthcare Clinic',
    icon: '👩‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (Paediatrics)'], education: 'Seth GS Medical College', bio: 'Dr. Sunita Gupta is a trusted paediatrician.', achievements: [], languages: ['English', 'Hindi'], fee: 500,
    schedule: { morning: { start: '08:00', end: '12:00', totalTokens: 25, tokenDuration: 10, active: true }, evening: { start: '15:00', end: '18:00', totalTokens: 15, tokenDuration: 10, active: true } }
  },
  {
    name: 'Dr. Naina Kulkarni', specialty: 'Psychiatrist', experience: '11+ years experience',
    rating: '4.7 (80 Reviews)', location: 'Bandra', clinicName: 'MindCare Wellness Center',
    icon: '👩‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (Psychiatry)'], education: 'KEM Hospital', bio: 'Dr. Naina Kulkarni is a compassionate psychiatrist.', achievements: [], languages: ['English', 'Hindi', 'Marathi'], fee: 900,
    schedule: { morning: { start: '10:00', end: '13:00', totalTokens: 12, tokenDuration: 30, active: true }, evening: { start: '16:00', end: '19:00', totalTokens: 8, tokenDuration: 30, active: true } }
  },
  {
    name: 'Dr. Priya Rajan', specialty: 'Paediatrician', experience: '13+ years experience',
    rating: '4.9 (230 Reviews)', location: 'Malad West', clinicName: 'ChildFirst Paediatrics',
    icon: '👩‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (Paediatrics)', 'Fellowship Neonatology'], education: 'Grant Medical College',
    bio: 'Dr. Priya Rajan is a leading paediatrician.', achievements: ['Best Paediatrician 2023'], languages: ['English', 'Hindi', 'Tamil'], fee: 600,
    schedule: { morning: { start: '09:00', end: '13:00', totalTokens: 20, tokenDuration: 12, active: true }, evening: { start: '17:00', end: '20:00', totalTokens: 15, tokenDuration: 12, active: true } }
  }
]

const CLINICS_DATA = [
  {
    name: 'Apollo Cardio Clinic', address: '12, Marine Drive, South Mumbai', location: 'South Mumbai',
    phone: '+91 22 4001 2345', rating: '4.8', reviews: 340, icon: '🏥',
    timings: 'Mon–Sat: 9 AM – 9 PM', specialties: ['Cardiology', 'General Medicine', 'ECG'],
    facilities: ['OPD', 'Lab Tests', 'X-Ray', 'Pharmacy'], tokensAvailable: 18, status: 'open',
    doctors: [
      { name: 'Dr. Sameer Shah', icon: '👨‍⚕️', specialty: 'Cardiologist', experience: '15 yrs', rating: '4.8', morning: '9:00–1:00 PM', evening: '5:00–8:00 PM' },
      { name: 'Dr. Rekha Pillai', icon: '👩‍⚕️', specialty: 'General Physician', experience: '10 yrs', rating: '4.7', morning: '10:00–1:00 PM', evening: 'Not Available' },
      { name: 'Dr. Amit Bose', icon: '👨‍⚕️', specialty: 'Cardiologist', experience: '8 yrs', rating: '4.6', morning: 'Not Available', evening: '5:00–9:00 PM' },
    ]
  },
  {
    name: 'Skin & Health Clinic', address: '45, Linking Road, Bandra West', location: 'Bandra West',
    phone: '+91 22 6510 7890', rating: '4.9', reviews: 215, icon: '🧴',
    timings: 'Mon–Sat: 10 AM – 8 PM', specialties: ['Dermatology', 'Cosmetology', 'Hair Care'],
    facilities: ['OPD', 'Laser Treatment', 'Consultation'], tokensAvailable: 12, status: 'open',
    doctors: [
      { name: 'Dr. Ananya Iyer', icon: '👩‍⚕️', specialty: 'Dermatologist', experience: '10 yrs', rating: '4.9', morning: '10:00–1:00 PM', evening: '5:00–8:00 PM' },
      { name: 'Dr. Pooja Sharma', icon: '👩‍⚕️', specialty: 'Cosmetologist', experience: '6 yrs', rating: '4.8', morning: '11:00–2:00 PM', evening: 'Not Available' },
      { name: 'Dr. Kiran Nair', icon: '👨‍⚕️', specialty: 'Hair & Scalp Specialist', experience: '5 yrs', rating: '4.7', morning: 'Not Available', evening: '4:00–7:00 PM' },
    ]
  },
  {
    name: 'Max Healthcare Clinic', address: '78, Veera Desai Road, Andheri East', location: 'Andheri East',
    phone: '+91 22 6700 5555', rating: '4.7', reviews: 580, icon: '🏨',
    timings: 'Mon–Sun: 8 AM – 10 PM', specialties: ['General Physician', 'Paediatrics', 'Orthopaedics'],
    facilities: ['OPD', 'Emergency', 'Lab', 'Pharmacy', 'ICU'], tokensAvailable: 0, status: 'full',
    doctors: [
      { name: 'Dr. Rahul Verma', icon: '👨‍⚕️', specialty: 'General Physician', experience: '12 yrs', rating: '4.7', morning: '9:00–12:00 PM', evening: '4:00–8:00 PM' },
      { name: 'Dr. Sunita Gupta', icon: '👩‍⚕️', specialty: 'Paediatrician', experience: '14 yrs', rating: '4.8', morning: '8:00–12:00 PM', evening: '3:00–6:00 PM' },
      { name: 'Dr. Ashok Mehta', icon: '👨‍⚕️', specialty: 'Orthopaedic Surgeon', experience: '18 yrs', rating: '4.9', morning: '10:00–1:00 PM', evening: '5:00–8:00 PM' },
      { name: 'Dr. Lata Krishnan', icon: '👩‍⚕️', specialty: 'General Physician', experience: '9 yrs', rating: '4.6', morning: 'Not Available', evening: '6:00–10:00 PM' },
    ]
  },
  {
    name: 'MindCare Wellness Center', address: '22, Hill Road, Bandra', location: 'Bandra',
    phone: '+91 22 4321 8800', rating: '4.6', reviews: 128, icon: '🧠',
    timings: 'Mon–Fri: 10 AM – 7 PM', specialties: ['Psychiatry', 'Psychology', 'Counselling'],
    facilities: ['Therapy Sessions', 'Group Counselling', 'Online Consult'], tokensAvailable: 8, status: 'open',
    doctors: [
      { name: 'Dr. Naina Kulkarni', icon: '👩‍⚕️', specialty: 'Psychiatrist', experience: '11 yrs', rating: '4.7', morning: '10:00–1:00 PM', evening: '4:00–7:00 PM' },
      { name: 'Dr. Raj Desai', icon: '👨‍⚕️', specialty: 'Clinical Psychologist', experience: '8 yrs', rating: '4.6', morning: '11:00–2:00 PM', evening: 'Not Available' },
      { name: 'Dr. Meena Joshi', icon: '👩‍⚕️', specialty: 'Counsellor', experience: '6 yrs', rating: '4.5', morning: 'Not Available', evening: '3:00–7:00 PM' },
    ]
  },
  {
    name: 'ChildFirst Paediatrics', address: '9, SV Road, Malad West', location: 'Malad West',
    phone: '+91 22 2888 6600', rating: '4.9', reviews: 430, icon: '👶',
    timings: 'Mon–Sat: 9 AM – 8 PM', specialties: ['Paediatrics', 'Neonatology', 'Vaccination'],
    facilities: ['OPD', 'Vaccination', 'Nutrition Advice', 'Lab'], tokensAvailable: 5, status: 'open',
    doctors: [
      { name: 'Dr. Priya Rajan', icon: '👩‍⚕️', specialty: 'Paediatrician', experience: '13 yrs', rating: '4.9', morning: '9:00–1:00 PM', evening: '5:00–8:00 PM' },
      { name: 'Dr. Arun Shetty', icon: '👨‍⚕️', specialty: 'Neonatologist', experience: '10 yrs', rating: '4.8', morning: '10:00–12:00 PM', evening: 'Not Available' },
      { name: 'Dr. Seema Patel', icon: '👩‍⚕️', specialty: 'Vaccination Specialist', experience: '7 yrs', rating: '4.7', morning: 'Not Available', evening: '4:00–7:00 PM' },
    ]
  }
]

// POST /api/seed — seed all data (drops existing)
router.post('/', async (req, res) => {
  try {
    const { force } = req.query

    const doctorCount = await Doctor.countDocuments()
    const clinicCount = await Clinic.countDocuments()

    if ((doctorCount > 0 || clinicCount > 0) && force !== 'true') {
      return res.json({ success: false, message: `DB already has data (${doctorCount} doctors, ${clinicCount} clinics). Use ?force=true to re-seed.` })
    }

    // Clear existing
    await Promise.all([Doctor.deleteMany({}), Clinic.deleteMany({}), Booking.deleteMany({}), TokenState.deleteMany({})])

    // Insert doctors and clinics
    const doctors = await Doctor.insertMany(DOCTORS_DATA)
    const clinics = await Clinic.insertMany(CLINICS_DATA)

    // Seed some initial bookings
    const firstDoctor = doctors[0]
    const thirdDoctor = doctors[2]
    await Booking.insertMany([
      { tokenId: 'TK-SEED-001', doctorId: firstDoctor._id, session: 'morning', visitType: 'clinic', patientName: 'Ravi Kumar', patientPhone: '9876543210', tokenNumber: 1, estimatedWait: 0 },
      { tokenId: 'TK-SEED-002', doctorId: firstDoctor._id, session: 'morning', visitType: 'online', patientName: 'Priya Mehta', patientPhone: '9876543211', tokenNumber: 2, estimatedWait: 10 },
      { tokenId: 'TK-SEED-003', doctorId: thirdDoctor._id, session: 'morning', visitType: 'clinic', patientName: 'Sunita Rao', patientPhone: '9876543213', tokenNumber: 1, estimatedWait: 0 },
    ])

    // Seed token states
    await TokenState.insertMany([
      { doctorId: firstDoctor._id, currentToken: 2, status: 'open', session: 'morning' },
      { doctorId: thirdDoctor._id, currentToken: 1, status: 'open', session: 'morning' },
    ])

    res.json({ success: true, message: `Seeded ${doctors.length} doctors, ${clinics.length} clinics, 3 bookings, 2 token states` })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/seed/status — check data status
router.get('/status', async (req, res) => {
  try {
    const [doctorCount, clinicCount, bookingCount] = await Promise.all([
      Doctor.countDocuments(), Clinic.countDocuments(), Booking.countDocuments()
    ])
    res.json({ success: true, data: { doctors: doctorCount, clinics: clinicCount, bookings: bookingCount } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router

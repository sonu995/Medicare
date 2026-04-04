const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('./models/Doctor');
const Clinic = require('./models/Clinic');
const Booking = require('./models/Booking');
const TokenState = require('./models/TokenState');

const MONGO_URI = process.env.MONGO_URI;

const DOCTORS_DATA = [
  {
    name: 'Dr. Sameer Shah', specialty: 'Cardiologist', experience: '15+ years experience',
    rating: '4.8 (120 Reviews)', location: 'South Mumbai', clinicName: 'Apollo Cardio Clinic',
    icon: '👨‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'MD (Cardiology)', 'DM (Cardiology)'], education: 'Grant Medical College, Mumbai',
    bio: 'Dr. Sameer Shah is a renowned cardiologist with over 15 years of experience in treating heart conditions.',
    achievements: ['Best Cardiologist Award 2023'],
    languages: ['English', 'Hindi', 'Marathi'], fee: 800,
    schedule: {
      morning: { start: '09:00', end: '13:00', totalTokens: 30, tokenDuration: 10, active: true },
      evening: { start: '17:00', end: '21:00', totalTokens: 20, tokenDuration: 10, active: true }
    }
  },
  {
    name: 'Dr. Amit Bose', specialty: 'Cardiologist', experience: '8+ years experience',
    rating: '4.6 (60 Reviews)', location: 'South Mumbai', clinicName: 'Apollo Cardio Clinic',
    icon: '👨‍⚕️', available: 'Today',
    qualifications: ['MBBS', 'DM (Cardiology)'], education: 'Medical College', bio: 'Dr. Amit Bose is a cardiologist.', achievements: [], languages: ['English', 'Hindi'], fee: 600,
    schedule: { morning: { start: '09:00', end: '12:00', totalTokens: 20, tokenDuration: 10, active: true }, evening: { start: '17:00', end: '21:00', totalTokens: 15, tokenDuration: 10, active: true } }
  }
];

const CLINICS_DATA = [
  {
    name: 'Apollo Cardio Clinic', address: '12, Marine Drive, South Mumbai', location: 'South Mumbai',
    phone: '+91 22 4001 2345', rating: '4.8', reviews: 340, icon: '🏥',
    timings: 'Mon–Sat: 9 AM – 9 PM', specialties: ['Cardiology'],
    facilities: ['OPD', 'Lab Tests'], tokensAvailable: 18, status: 'open',
    doctors: [
      { name: 'Dr. Sameer Shah', icon: '👨‍⚕️', specialty: 'Cardiologist', experience: '15 yrs', rating: '4.8', morning: '9:00–1:00 PM', evening: '5:00–8:00 PM' },
      { name: 'Dr. Amit Bose', icon: '👨‍⚕️', specialty: 'Cardiologist', experience: '8 yrs', rating: '4.6', morning: 'Not Available', evening: '5:00–9:00 PM' },
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 60000 });
    console.log('Connected!');

    await Promise.all([
      Doctor.deleteMany({}),
      Clinic.deleteMany({}),
      Booking.deleteMany({}),
      TokenState.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    const doctors = await Doctor.insertMany(DOCTORS_DATA);
    const clinics = await Clinic.insertMany(CLINICS_DATA);
    console.log(`Inserted ${doctors.length} doctors and ${clinics.length} clinics.`);

    const amit = doctors.find(d => d.name === 'Dr. Amit Bose');
    await TokenState.create({
        doctorId: amit._id,
        currentToken: 1,
        status: 'open',
        session: 'evening'
    });
    console.log('Seeded token state for Dr. Amit Bose.');

    console.log('Seed successful!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();

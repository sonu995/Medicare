const express = require('express')
const router = express.Router()
const Doctor = require('../models/Doctor')
const Booking = require('../models/Booking')
const Clinic = require('../models/Clinic')

// GET /api/doctors — with search & filter query params
// ?q=&specialty=&location=&rating=&available=&sort=name|rating|tokens
router.get('/', async (req, res) => {
  try {
    const { q, specialty, location, rating, available, sort } = req.query
    const filter = {}

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { specialty: { $regex: q, $options: 'i' } },
        { clinicName: { $regex: q, $options: 'i' } }
      ]
    }
    if (specialty && specialty !== 'All') filter.specialty = specialty
    if (location) filter.location = { $regex: location, $options: 'i' }
    if (available && available === 'Today') filter.available = 'Today'
    if (rating) {
      // rating field looks like "4.5 (50 Reviews)" — filter by numeric prefix
      const minRating = parseFloat(rating)
      filter.$expr = { $gte: [{ $toDouble: { $arrayElemAt: [{ $split: ['$rating', ' '] }, 0] } }, minRating] }
    }

    let sortObj = { name: 1 }
    if (sort === 'rating') sortObj = { rating: -1 }
    else if (sort === 'fee') sortObj = { fee: 1 }

    const doctors = await Doctor.find(filter).sort(sortObj).lean()
    res.json({ success: true, count: doctors.length, data: doctors })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/doctors/specialties — unique specialty list
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty')
    res.json({ success: true, data: ['All', ...specialties.sort()] })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/doctors/locations — unique location list
router.get('/locations', async (req, res) => {
  try {
    const locations = await Doctor.distinct('location')
    res.json({ success: true, data: locations.sort() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).lean()
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' })

    // Attach booking count
    const bookingCount = await Booking.countDocuments({ doctorId: req.params.id })
    res.json({ success: true, data: { ...doctor, totalBookings: bookingCount } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/doctors — add new doctor
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body)
    await doctor.save()
    res.status(201).json({ success: true, data: doctor })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// PUT /api/doctors/:id — update doctor
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' })
    
    // If doctor is approved, add to clinic's doctors array
    if (req.body.status === 'approved' && doctor.clinicId) {
      const clinicDoctor = {
        name: doctor.name,
        icon: doctor.icon,
        specialty: doctor.specialty,
        experience: doctor.experience,
        rating: doctor.rating,
        morning: doctor.schedule?.morning?.active ? `${doctor.schedule.morning.start}–${doctor.schedule.morning.end} PM` : 'Not Available',
        evening: doctor.schedule?.evening?.active ? `${doctor.schedule.evening.start}–${doctor.schedule.evening.end} PM` : 'Not Available'
      }
      // Manual $addToSet since mockDb doesn't support MongoDB operators
      const clinic = await Clinic.findOne({ _id: doctor.clinicId })
      if (clinic) {
        const exists = clinic.doctors?.some(d => d.name === clinicDoctor.name)
        if (!exists) {
          clinic.doctors = clinic.doctors || []
          clinic.doctors.push(clinicDoctor)
          await clinic.save()
        }
      }
    }
    
    res.json({ success: true, data: doctor })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// DELETE /api/doctors/:id
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id)
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' })
    res.json({ success: true, message: 'Doctor deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router

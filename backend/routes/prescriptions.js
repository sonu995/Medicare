const express = require('express')
const router = express.Router()
const Prescription = require('../mockDb').Prescription

// GET /api/prescriptions - Get all prescriptions with filters
router.get('/', async (req, res) => {
  try {
    const { clinicId, doctorId, patientPhone, date, limit } = req.query
    const filter = {}

    if (clinicId) filter.clinicId = clinicId
    if (doctorId) filter.doctorId = doctorId
    if (patientPhone) filter.patientPhone = { $regex: patientPhone, $options: 'i' }
    if (date) {
      const d = new Date(date)
      const start = new Date(d.setHours(0, 0, 0, 0))
      const end = new Date(d.setHours(23, 59, 59, 999))
      filter.date = { $gte: start, $lte: end }
    }

    let prescriptions = await Prescription.find(filter)
    prescriptions = prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date))

    if (limit) {
      prescriptions = prescriptions.slice(0, parseInt(limit))
    }

    res.json({ success: true, count: prescriptions.length, data: prescriptions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/prescriptions/:id - Get single prescription
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' })
    }
    res.json({ success: true, data: prescription })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/prescriptions/patient/:phone - Get prescriptions by patient phone
router.get('/patient/:phone', async (req, res) => {
  try {
    const phone = req.params.phone
    console.log('Getting prescriptions for phone:', phone)
    const prescriptions = await Prescription.find({ patientPhone: phone })
    console.log('Found prescriptions:', prescriptions.length)
    prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json({ success: true, count: prescriptions.length, data: prescriptions })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/prescriptions - Create new prescription
router.post('/', async (req, res) => {
  try {
    const {
      patientName,
      patientPhone,
      doctorId,
      doctorName,
      clinicId,
      clinicName,
      chiefComplaint,
      diagnosis,
      medicines,
      advice,
      followUp,
      investigations,
      bookingId,
      age,
      gender
    } = req.body

    if (!patientName || !doctorId) {
      return res.status(400).json({ success: false, error: 'Patient name and doctor are required' })
    }

    const prescriptionId = `RX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const prescription = new Prescription({
      prescriptionId,
      patientName,
      patientPhone: patientPhone || '',
      doctorId,
      doctorName: doctorName || '',
      clinicId: clinicId || '',
      clinicName: clinicName || '',
      chiefComplaint: chiefComplaint || '',
      diagnosis: diagnosis || '',
      medicines: medicines || [],
      advice: advice || '',
      followUp: followUp || '',
      investigations: investigations || '',
      bookingId: bookingId || '',
      age: age || '',
      gender: gender || '',
      date: new Date(),
      status: 'active'
    })

    await prescription.save()

    res.status(201).json({ success: true, data: prescription })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/prescriptions/:id - Update prescription
router.put('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' })
    }

    res.json({ success: true, data: prescription })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/prescriptions/:id - Delete prescription
router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id)
    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' })
    }
    res.json({ success: true, message: 'Prescription deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/prescriptions/stats/overview - Get prescription stats
router.get('/stats/overview', async (req, res) => {
  try {
    const { clinicId, doctorId } = req.query
    const filter = {}
    
    if (clinicId) filter.clinicId = clinicId
    if (doctorId) filter.doctorId = doctorId

    const prescriptions = await Prescription.find(filter)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayPrescriptions = prescriptions.filter(p => {
      const date = new Date(p.date)
      return date >= today && date <= todayEnd
    })

    const uniquePatients = new Set(prescriptions.map(p => p.patientPhone).filter(Boolean))

    res.json({
      success: true,
      data: {
        total: prescriptions.length,
        today: todayPrescriptions.length,
        uniquePatients: uniquePatients.size
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router

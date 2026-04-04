const express = require('express')
const router = express.Router()
const Clinic = require('../models/Clinic')

// GET /api/clinics?q=&location=&specialty=&status=
router.get('/', async (req, res) => {
  try {
    const { q, location, specialty, status } = req.query
    const filter = {}

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { specialties: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    }
    if (location) filter.location = { $regex: location, $options: 'i' }
    if (specialty) filter.specialties = { $elemMatch: { $regex: specialty, $options: 'i' } }
    if (status) filter.status = status

    const clinics = await Clinic.find(filter).sort({ name: 1 }).lean()
    res.json({ success: true, count: clinics.length, data: clinics })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/clinics/locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Clinic.distinct('location')
    res.json({ success: true, data: locations.sort() })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/clinics/:id
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).lean()
    if (!clinic) return res.status(404).json({ success: false, error: 'Clinic not found' })
    res.json({ success: true, data: clinic })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/clinics
router.post('/', async (req, res) => {
  try {
    const clinic = new Clinic(req.body)
    await clinic.save()
    res.status(201).json({ success: true, data: clinic })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// PUT /api/clinics/:id
router.put('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!clinic) return res.status(404).json({ success: false, error: 'Clinic not found' })
    res.json({ success: true, data: clinic })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// DELETE /api/clinics/:id
router.delete('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id)
    if (!clinic) return res.status(404).json({ success: false, error: 'Clinic not found' })
    res.json({ success: true, message: 'Clinic deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router

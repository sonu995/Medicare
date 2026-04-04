const express = require('express')
const router = express.Router()
const TokenState = require('../models/TokenState')

// GET /api/token-states — all states (optionally filter by doctorId list)
router.get('/', async (req, res) => {
  try {
    const states = await TokenState.find().lean()
    // Return as object keyed by doctorId for easy lookup in frontend
    const stateMap = {}
    states.forEach(s => { stateMap[s.doctorId.toString()] = s })
    res.json({ success: true, data: stateMap })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/token-states/:doctorId
router.get('/:doctorId', async (req, res) => {
  try {
    const state = await TokenState.findOne({ doctorId: req.params.doctorId }).lean()
    if (!state) return res.json({ success: true, data: { currentToken: 0, status: 'open', session: 'morning' } })
    res.json({ success: true, data: state })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/token-states/:doctorId — upsert token state
router.put('/:doctorId', async (req, res) => {
  try {
    const state = await TokenState.findOneAndUpdate(
      { doctorId: req.params.doctorId },
      { ...req.body, doctorId: req.params.doctorId },
      { new: true, upsert: true, runValidators: true }
    )
    res.json({ success: true, data: state })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// DELETE /api/token-states/:doctorId
router.delete('/:doctorId', async (req, res) => {
  try {
    await TokenState.findOneAndDelete({ doctorId: req.params.doctorId })
    res.json({ success: true, message: 'Token state reset' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router

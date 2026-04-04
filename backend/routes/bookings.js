const express = require('express')
const router = express.Router()
const Booking = require('../models/Booking')
const Doctor = require('../models/Doctor')

// GET /api/bookings — all bookings, filterable by doctorId, date, session, patientPhone
router.get('/', async (req, res) => {
  try {
    const { doctorId, date, session, patientPhone } = req.query
    const filter = {}

    if (doctorId) filter.doctorId = doctorId
    if (session) filter.session = session
    if (patientPhone) filter.patientPhone = { $regex: patientPhone, $options: 'i' }
    if (date) {
      const d = new Date(date)
      const start = new Date(d.setHours(0, 0, 0, 0))
      const end = new Date(d.setHours(23, 59, 59, 999))
      filter.bookingDate = { $gte: start, $lte: end }
    }

    const bookings = await Booking.find(filter)
      .populate('doctorId', 'name specialty location icon')
      .sort({ bookingDate: -1 })
      .lean()

    res.json({ success: true, count: bookings.length, data: bookings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/bookings/today — today's bookings
router.get('/today', async (req, res) => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const bookings = await Booking.find({ bookingDate: { $gte: start, $lte: end } })
      .populate('doctorId', 'name specialty icon')
      .sort({ tokenNumber: 1 })
      .lean()

    res.json({ success: true, count: bookings.length, data: bookings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/bookings/stats — for admin dashboard overview
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [total, todayCount, clinicCount, onlineCount, morningCount, eveningCount] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ bookingDate: { $gte: today, $lte: todayEnd } }),
      Booking.countDocuments({ visitType: 'clinic', bookingDate: { $gte: today, $lte: todayEnd } }),
      Booking.countDocuments({ visitType: 'online', bookingDate: { $gte: today, $lte: todayEnd } }),
      Booking.countDocuments({ session: 'morning', bookingDate: { $gte: today, $lte: todayEnd } }),
      Booking.countDocuments({ session: 'evening', bookingDate: { $gte: today, $lte: todayEnd } }),
    ])

    res.json({ success: true, data: { total, today: todayCount, clinic: clinicCount, online: onlineCount, morning: morningCount, evening: eveningCount } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/bookings/walkin-stats — walk-in specific analytics
router.get('/walkin-stats', async (req, res) => {
  try {
    const { days = '30', clinicId } = req.query
    const daysNum = parseInt(days)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysNum)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const matchStage = {
      visitType: 'walk-in',
      bookingDate: { $gte: startDate, $lte: endDate }
    }
    if (clinicId) matchStage.clinicId = clinicId

    const stats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalWalkIns: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          serving: { $sum: { $cond: [{ $eq: ['$status', 'serving'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          morning: { $sum: { $cond: [{ $eq: ['$session', 'morning'] }, 1, 0] } },
          evening: { $sum: { $cond: [{ $eq: ['$session', 'evening'] }, 1, 0] } },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $ifNull: ['$fee', 0] },
                0
              ]
            }
          }
        }
      }
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayMatch = { ...matchStage, bookingDate: { $gte: today, $lte: todayEnd } }
    const todayCount = await Booking.countDocuments(todayMatch)

    const dailyData = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          walkIns: { $sum: 1 },
          morning: { $sum: { $cond: [{ $eq: ['$session', 'morning'] }, 1, 0] } },
          evening: { $sum: { $cond: [{ $eq: ['$session', 'evening'] }, 1, 0] } },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $ifNull: ['$fee', 0] },
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const doctorStats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$doctorId',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$doctor.name', 'Unknown'] },
          icon: { $ifNull: ['$doctor.icon', '👨‍⚕️'] },
          total: 1,
          completed: 1,
          cancelled: 1
        }
      },
      { $sort: { total: -1 } }
    ])

    const data = stats[0] || {
      totalWalkIns: 0,
      completed: 0,
      cancelled: 0,
      serving: 0,
      pending: 0,
      morning: 0,
      evening: 0,
      totalRevenue: 0
    }

    res.json({
      success: true,
      data: {
        ...data,
        todayWalkIns: todayCount,
        dailyData,
        doctorStats,
        completionRate: data.totalWalkIns > 0 ? Math.round((data.completed / data.totalWalkIns) * 100) : 0,
        cancellationRate: data.totalWalkIns > 0 ? Math.round((data.cancelled / data.totalWalkIns) * 100) : 0
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/bookings/unique-patients — distinct patients
router.get('/unique-patients', async (req, res) => {
  try {
    const patients = await Booking.aggregate([
      { $sort: { bookingDate: -1 } },
      { $group: {
        _id: '$patientPhone',
        name: { $first: '$patientName' },
        phone: { $first: '$patientPhone' },
        visits: { $sum: 1 },
        lastVisit: { $first: '$bookingDate' },
        lastDoctorId: { $first: '$doctorId' }
      }},
      { $lookup: { from: 'doctors', localField: 'lastDoctorId', foreignField: '_id', as: 'doctor' } },
      { $addFields: { lastDoctor: { $arrayElemAt: ['$doctor.name', 0] } } },
      { $project: { doctor: 0, lastDoctorId: 0 } },
      { $sort: { lastVisit: -1 } }
    ])
    res.json({ success: true, count: patients.length, data: patients })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/bookings — book a new token
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/bookings called')
    console.log('Body:', req.body)
    
    const { doctorId, session, visitType, patientName, patientPhone, bookingDate } = req.body
    if (!doctorId || !session || !patientName) {
      return res.status(400).json({ success: false, error: 'doctorId, session, patientName are required' })
    }

    const doctor = await Doctor.findById(doctorId)
    console.log('Doctor found:', doctor ? 'Yes' : 'No')
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' })

    const sessionData = doctor.schedule[session]
    console.log('Session data:', sessionData)
    if (!sessionData || !sessionData.active) {
      return res.status(400).json({ success: false, error: `${session} session is not active` })
    }

    // Count today's bookings for this doctor+session
    const targetDate = bookingDate ? new Date(bookingDate) : new Date()
    const dayStart = new Date(targetDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(targetDate)
    dayEnd.setHours(23, 59, 59, 999)

    const sessionBookings = await Booking.countDocuments({
      doctorId, 
      session,
      bookingDate: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' }
    })
    console.log('Existing bookings:', sessionBookings)

    if (sessionBookings >= sessionData.totalTokens) {
      return res.status(400).json({ 
        success: false, 
        error: `Sorry, the ${session} session is fully booked`, 
        full: true 
      })
    }

    const tokenNumber = sessionBookings + 1
    const estimatedWait = (tokenNumber - 1) * sessionData.tokenDuration
    const tokenId = `TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const bookingData = {
      tokenId, doctorId, session, visitType: visitType || 'clinic',
      patientName, patientPhone: patientPhone || '',
      tokenNumber, estimatedWait,
      bookingDate: targetDate,
      fee: doctor.fee || 500,
      status: 'pending'
    }
    
    console.log('Creating booking with data:', bookingData)
    const booking = new Booking(bookingData)
    const saved = await booking.save()
    console.log('Booking saved:', saved)

    res.status(201).json({ success: true, data: saved })
  } catch (err) {
    console.error('Error in POST /bookings:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/bookings/:id/status — update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })
    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Booking cancelled' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router

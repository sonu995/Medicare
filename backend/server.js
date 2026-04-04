require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean)
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/clinics', require('./routes/clinics'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/token-states', require('./routes/tokenStates'))
app.use('/api/prescriptions', require('./routes/prescriptions'))
app.use('/api/seed', require('./routes/seed'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})

// Connect to MongoDB
const PORT = process.env.PORT || 5001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicare_plus'

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI)
  })
  .catch(err => {
    console.error('❌ MongoDB connection error (using mock fallback):', err.message)
    // Don't exit, allow the server to run with mocks
  })

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`))


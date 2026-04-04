import apiClient from './apiClient'

// GET /api/bookings with optional filters
export const fetchBookings = (params = {}) => apiClient.get('/bookings', { params })

// GET /api/bookings/today
export const fetchTodayBookings = () => apiClient.get('/bookings/today')

// GET /api/bookings/stats
export const fetchBookingStats = () => apiClient.get('/bookings/stats')

// GET /api/bookings/walkin-stats
export const fetchWalkinStats = (params = {}) => apiClient.get('/bookings/walkin-stats', { params })

// GET /api/bookings/unique-patients
export const fetchUniquePatients = () => apiClient.get('/bookings/unique-patients')

// POST /api/bookings — book a token
export const bookToken = (data) => apiClient.post('/bookings', data)

// PUT /api/bookings/:id/status
export const updateBookingStatus = (id, status) => apiClient.put(`/bookings/${id}/status`, { status })

// DELETE /api/bookings/:id
export const cancelBooking = (id) => apiClient.delete(`/bookings/${id}`)

// GET /api/token-states
export const fetchTokenStates = () => apiClient.get('/token-states')

// GET /api/token-states/:doctorId
export const fetchTokenState = (doctorId) => apiClient.get(`/token-states/${doctorId}`)

// PUT /api/token-states/:doctorId
export const updateTokenState = (doctorId, data) => apiClient.put(`/token-states/${doctorId}`, data)

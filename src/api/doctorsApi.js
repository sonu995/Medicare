import apiClient from './apiClient'

// GET /api/doctors with optional filters
export const fetchDoctors = (params = {}) => apiClient.get('/doctors', { params })

// GET /api/doctors/:id
export const fetchDoctor = (id) => apiClient.get(`/doctors/${id}`)

// GET /api/doctors/specialties
export const fetchSpecialties = () => apiClient.get('/doctors/specialties')

// GET /api/doctors/locations
export const fetchDoctorLocations = () => apiClient.get('/doctors/locations')

// POST /api/doctors
export const createDoctor = (data) => apiClient.post('/doctors', data)

// PUT /api/doctors/:id
export const updateDoctor = (id, data) => apiClient.put(`/doctors/${id}`, data)

// DELETE /api/doctors/:id
export const deleteDoctor = (id) => apiClient.delete(`/doctors/${id}`)

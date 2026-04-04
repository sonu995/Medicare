import apiClient from './apiClient'

// GET /api/clinics with optional filters
export const fetchClinics = (params = {}) => apiClient.get('/clinics', { params })

// GET /api/clinics/:id
export const fetchClinic = (id) => apiClient.get(`/clinics/${id}`)

// POST /api/clinics
export const createClinic = (data) => apiClient.post('/clinics', data)

// PUT /api/clinics/:id
export const updateClinic = (id, data) => apiClient.put(`/clinics/${id}`, data)

// DELETE /api/clinics/:id
export const deleteClinic = (id) => apiClient.delete(`/clinics/${id}`)

import apiClient from './apiClient'

export const fetchPrescriptions = (params = {}) => apiClient.get('/prescriptions', { params })

export const fetchPrescription = (id) => apiClient.get(`/prescriptions/${id}`)

export const fetchPrescriptionByPatient = (phone) => apiClient.get(`/prescriptions/patient/${phone}`)

export const createPrescription = (data) => apiClient.post('/prescriptions', data)

export const updatePrescription = (id, data) => apiClient.put(`/prescriptions/${id}`, data)

export const deletePrescription = (id) => apiClient.delete(`/prescriptions/${id}`)

export const fetchPrescriptionStats = (params = {}) => apiClient.get('/prescriptions/stats/overview', { params })

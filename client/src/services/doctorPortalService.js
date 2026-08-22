import api from './api';

export const myAppointments = () => api.get('/doctor/appointments').then((r) => r.data);
export const getAppointment = (id) => api.get(`/doctor/appointments/${id}`).then((r) => r.data);
export const completeAppointment = (id, data) => api.put(`/doctor/appointments/${id}/complete`, data).then((r) => r.data);
export const getProfile = () => api.get('/doctor/profile').then((r) => r.data);
export const updateProfile = (data) => api.put('/doctor/profile', data).then((r) => r.data);

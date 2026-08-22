import api from './api';

export const holdSlot = (data) => api.post('/appointments/hold', data).then((r) => r.data);
export const confirmAppointment = (data) => api.post('/appointments/confirm', data).then((r) => r.data);
export const myAppointments = () => api.get('/appointments/my').then((r) => r.data);
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`).then((r) => r.data);
export const rescheduleAppointment = (id, data) => api.put(`/appointments/${id}/reschedule`, data).then((r) => r.data);

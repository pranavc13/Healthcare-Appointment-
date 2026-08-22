import api from './api';

export const listDoctors = () => api.get('/admin/doctors').then((r) => r.data);
export const createDoctor = (data) => api.post('/admin/doctors', data).then((r) => r.data);
export const updateDoctor = (id, data) => api.put(`/admin/doctors/${id}`, data).then((r) => r.data);
export const deactivateDoctor = (id) => api.delete(`/admin/doctors/${id}`).then((r) => r.data);
export const markLeave = (id, data) => api.put(`/admin/doctors/${id}/leave`, data).then((r) => r.data);

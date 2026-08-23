import api from './api';

// The directory endpoint returns an envelope: { doctors, page, limit, total, totalPages }.
export const listDoctors = (params) => api.get('/doctors', { params }).then((r) => r.data);
export const getFacets = () => api.get('/doctors/facets').then((r) => r.data);
export const getDoctor = (id) => api.get(`/doctors/${id}`).then((r) => r.data);
export const getSlots = (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }).then((r) => r.data);

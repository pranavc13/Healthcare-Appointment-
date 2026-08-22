import api from './api';

export const getAuthUrl = () => api.get('/calendar/auth-url').then((r) => r.data);

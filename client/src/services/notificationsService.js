import api from './api';

export const myNotifications = () => api.get('/notifications/my').then((r) => r.data);

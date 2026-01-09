import apiClient from './apiClient';

export const reservationService = {
  create: async (data) => {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  getMesReservations: async () => {
    const response = await apiClient.get('/reservations/me');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await apiClient.put(`/reservations/${id}/annuler`);
    return response.data;
  },

  finish: async (id) => {
    const response = await apiClient.put(`/reservations/${id}/terminer`);
    return response.data;
  },

  // Admin endpoints
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/reservations/all?${params}`);
    return response.data;
  },

  validate: async (id) => {
    const response = await apiClient.put(`/reservations/${id}/valider`);
    return response.data;
  },
};

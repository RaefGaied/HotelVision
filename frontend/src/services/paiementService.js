import apiClient from './apiClient';

export const paiementService = {
  create: async (data) => {
    const response = await apiClient.post('/paiements', data);
    return response.data;
  },

  getByReservation: async (reservationId) => {
    const response = await apiClient.get(`/paiements/reservation/${reservationId}`);
    return response.data;
  },

  getMesPaiements: async () => {
    const response = await apiClient.get('/paiements/me');
    return response.data;
  },

  // Admin endpoints
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/paiements?${params}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/paiements/${id}`, data);
    return response.data;
  },

  refund: async (id) => {
    const response = await apiClient.put(`/paiements/${id}/rembourser`);
    return response.data;
  },
};

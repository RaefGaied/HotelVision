import apiClient from './apiClient';

export const factureService = {
  generate: async (data) => {
    const response = await apiClient.post('/factures', data);
    return response.data;
  },

  getByReservation: async (resId) => {
    const response = await apiClient.get(`/factures/${resId}`);
    return response.data;
  },

  getMesFactures: async () => {
    const response = await apiClient.get('/factures/me');
    return response.data;
  },

  // Admin endpoints
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/factures?${params}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/factures/${id}`, data);
    return response.data;
  },
};

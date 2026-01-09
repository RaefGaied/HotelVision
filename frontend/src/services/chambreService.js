import apiClient from './apiClient';

export const chambreService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/chambres?${params}`);
    return response.data;
  },

  getByHotel: async (hotelId) => {
    const response = await apiClient.get(`/chambres/hotel/${hotelId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/chambres/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/chambres', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/chambres/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, statut) => {
    const response = await apiClient.put(`/chambres/${id}/statut`, { statut });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/chambres/${id}`);
    return response.data;
  },
};

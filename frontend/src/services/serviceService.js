import apiClient from './apiClient';

export const serviceService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/services?${params}`);
    return response.data;
  },

  getByHotel: async (hotelId) => {
    const response = await apiClient.get(`/services/hotel/${hotelId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/services', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  toggle: async (id) => {
    const response = await apiClient.put(`/services/${id}/toggle`);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  },
};

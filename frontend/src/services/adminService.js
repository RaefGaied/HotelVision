import apiClient from './apiClient';

export const adminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Hotel management
  createHotel: async (data) => {
    const response = await apiClient.post('/hotels', data);
    return response.data;
  },

  getHotels: async () => {
    const response = await apiClient.get('/hotels');
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await apiClient.get(`/hotels/${id}`);
    return response.data;
  },

  updateHotel: async (id, data) => {
    const response = await apiClient.put(`/hotels/${id}`, data);
    return response.data;
  },

  deleteHotel: async (id) => {
    const response = await apiClient.delete(`/hotels/${id}`);
    return response.data;
  },
};

import apiClient from './apiClient';

export const userService = {
  register: async (data) => {
    const response = await apiClient.post('/users/register', data);
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.put('/users/change-password', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/users/account');
    return response.data;
  },

  // Admin endpoints
  getAllUsers: async () => {
    const response = await apiClient.get('/users/admin/users');
    return response.data;
  },
};

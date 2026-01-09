import apiClient from './apiClient';

export const hotelService = {
  getAll: async () => {
    const response = await apiClient.get('/hotels');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/hotels/${id}`);
    return response.data;
  },

  create: async (data) => {
    // Check if data contains a File object for image
    if (data instanceof FormData || data.image instanceof File) {
      // Use FormData for file upload
      const formData = new FormData();

      // Add all fields
      Object.keys(data).forEach((key) => {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (key !== 'image') {
          if (key === 'chambres' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      const response = await apiClient.post('/hotels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Regular JSON request
      const response = await apiClient.post('/hotels', data);
      return response.data;
    }
  },

  update: async (id, data) => {
    // Check if data contains a File object for image
    if (data instanceof FormData || (data.image && data.image instanceof File)) {
      // Use FormData for file upload
      const formData = new FormData();

      // Add all fields
      Object.keys(data).forEach((key) => {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });

      const response = await apiClient.put(`/hotels/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Regular JSON request
      const response = await apiClient.put(`/hotels/${id}`, data);
      return response.data;
    }
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/hotels/${id}`);
    return response.data;
  },

  generateDescription: async (hotelData) => {
    const response = await apiClient.post('/hotels/generate-description', hotelData);
    return response.data;
  },

  analyzeSentiment: async (text) => {
    const response = await apiClient.post('/hotels/analyze-sentiment', { text });
    return response.data;
  },
};

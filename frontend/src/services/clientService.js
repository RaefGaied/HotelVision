import apiClient from "./apiClient";

const clientService = {
  getAllClients: async () => {
    const response = await apiClient.get("/users/admin/clients");
    return response.data;
  },

  toggleClientActivation: async (clientId) => {
    const response = await apiClient.put(`/users/admin/clients/${clientId}/toggle`);
    return response.data;
  },
};

export default clientService;

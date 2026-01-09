import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import clientService from "../services/clientService";

export const fetchAllClients = createAsyncThunk(
  "clients/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await clientService.getAllClients();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des clients");
    }
  }
);

export const toggleClientActivation = createAsyncThunk(
  "clients/toggleActivation",
  async (clientId, { rejectWithValue }) => {
    try {
      const data = await clientService.toggleClientActivation(clientId);
      return data.client;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la modification du statut");
    }
  }
);

const clientSlice = createSlice({
  name: "clients",
  initialState: {
    clients: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchAllClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleClientActivation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleClientActivation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(toggleClientActivation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default clientSlice.reducer;

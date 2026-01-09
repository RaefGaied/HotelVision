import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService } from '../services/serviceService';

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await serviceService.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchServicesByHotel = createAsyncThunk(
  'services/fetchByHotel',
  async (hotelId, { rejectWithValue }) => {
    try {
      const response = await serviceService.getByHotel(hotelId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const createService = createAsyncThunk(
  'services/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await serviceService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la création');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await serviceService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la modification');
    }
  }
);

export const toggleService = createAsyncThunk(
  'services/toggle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceService.toggle(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du changement de statut');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/delete',
  async (id, { rejectWithValue }) => {
    try {
      await serviceService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la suppression');
    }
  }
);

const initialState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Hotel
    builder
      .addCase(fetchServicesByHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServicesByHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServicesByHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By ID
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createService.pending, (state) => {
        state.loading = true;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        state.currentService = action.payload;
      });

    // Toggle
    builder
      .addCase(toggleService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      });

    // Delete
    builder
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s._id !== action.payload);
      });
  },
});

export const { clearError } = serviceSlice.actions;
export default serviceSlice.reducer;

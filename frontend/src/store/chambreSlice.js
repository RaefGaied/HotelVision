import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chambreService } from '../services/chambreService';

export const fetchChambres = createAsyncThunk(
  'chambres/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await chambreService.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchChambresByHotel = createAsyncThunk(
  'chambres/fetchByHotel',
  async (hotelId, { rejectWithValue }) => {
    try {
      const response = await chambreService.getByHotel(hotelId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchChambreById = createAsyncThunk(
  'chambres/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await chambreService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const createChambre = createAsyncThunk(
  'chambres/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await chambreService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la création');
    }
  }
);

export const updateChambre = createAsyncThunk(
  'chambres/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await chambreService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la modification');
    }
  }
);

export const deleteChambre = createAsyncThunk(
  'chambres/delete',
  async (id, { rejectWithValue }) => {
    try {
      await chambreService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la suppression');
    }
  }
);

export const updateChambreStatus = createAsyncThunk(
  'chambres/updateStatus',
  async ({ id, statut }, { rejectWithValue }) => {
    try {
      const response = await chambreService.updateStatus(id, statut);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour du statut');
    }
  }
);

export const createChambreForHotel = createAsyncThunk(
  'chambres/createForHotel',
  async (data, { rejectWithValue }) => {
    try {
      const response = await chambreService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la création');
    }
  }
);

const initialState = {
  chambres: [],
  currentChambre: null,
  loading: false,
  error: null,
};

const chambreSlice = createSlice({
  name: 'chambres',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchChambres.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChambres.fulfilled, (state, action) => {
        state.loading = false;
        state.chambres = action.payload;
      })
      .addCase(fetchChambres.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By ID
    builder
      .addCase(fetchChambreById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChambreById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChambre = action.payload;
      })
      .addCase(fetchChambreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createChambre.pending, (state) => {
        state.loading = true;
      })
      .addCase(createChambre.fulfilled, (state, action) => {
        state.loading = false;
        state.chambres.push(action.payload);
      })
      .addCase(createChambre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateChambre.fulfilled, (state, action) => {
        const index = state.chambres.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.chambres[index] = action.payload;
        }
        state.currentChambre = action.payload;
      });

    // Delete
    builder
      .addCase(deleteChambre.fulfilled, (state, action) => {
        state.chambres = state.chambres.filter(c => c._id !== action.payload);
      });
  },
});

export const { clearError } = chambreSlice.actions;
export default chambreSlice.reducer;

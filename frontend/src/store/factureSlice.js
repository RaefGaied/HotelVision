import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { factureService } from '../services/factureService';

export const generateFacture = createAsyncThunk(
  'factures/generate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await factureService.generate(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la génération');
    }
  }
);

export const fetchFactureByReservation = createAsyncThunk(
  'factures/fetchByReservation',
  async (resId, { rejectWithValue }) => {
    try {
      const response = await factureService.getByReservation(resId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchMesFactures = createAsyncThunk(
  'factures/fetchMes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await factureService.getMesFactures();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchAllFactures = createAsyncThunk(
  'factures/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await factureService.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const updateFacture = createAsyncThunk(
  'factures/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await factureService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

const initialState = {
  factures: [],
  currentFacture: null,
  loading: false,
  error: null,
};

const factureSlice = createSlice({
  name: 'factures',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generate
    builder
      .addCase(generateFacture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateFacture.fulfilled, (state, action) => {
        state.loading = false;
        state.factures.push(action.payload);
        state.currentFacture = action.payload;
      })
      .addCase(generateFacture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Reservation
    builder
      .addCase(fetchFactureByReservation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFactureByReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFacture = action.payload;
      })
      .addCase(fetchFactureByReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Mes Factures
    builder
      .addCase(fetchMesFactures.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMesFactures.fulfilled, (state, action) => {
        state.loading = false;
        state.factures = action.payload;
      })
      .addCase(fetchMesFactures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch All (Admin)
    builder
      .addCase(fetchAllFactures.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllFactures.fulfilled, (state, action) => {
        state.loading = false;
        state.factures = action.payload;
      })
      .addCase(fetchAllFactures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateFacture.fulfilled, (state, action) => {
        const index = state.factures.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.factures[index] = action.payload;
        }
        state.currentFacture = action.payload;
      });
  },
});

export const { clearError } = factureSlice.actions;
export default factureSlice.reducer;

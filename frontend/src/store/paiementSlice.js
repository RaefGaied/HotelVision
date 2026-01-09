import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paiementService } from '../services/paiementService';

export const createPaiement = createAsyncThunk(
  'paiements/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await paiementService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du paiement');
    }
  }
);

export const fetchPaiementByReservation = createAsyncThunk(
  'paiements/fetchByReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await paiementService.getByReservation(reservationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchMesPaiements = createAsyncThunk(
  'paiements/fetchMes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paiementService.getMesPaiements();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchAllPaiements = createAsyncThunk(
  'paiements/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paiementService.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const updatePaiement = createAsyncThunk(
  'paiements/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await paiementService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

export const refundPaiement = createAsyncThunk(
  'paiements/refund',
  async (id, { rejectWithValue }) => {
    try {
      const response = await paiementService.refund(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du remboursement');
    }
  }
);

const initialState = {
  paiements: [],
  currentPaiement: null,
  loading: false,
  error: null,
};

const paiementSlice = createSlice({
  name: 'paiements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createPaiement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaiement.fulfilled, (state, action) => {
        state.loading = false;
        state.paiements.push(action.payload);
        state.currentPaiement = action.payload;
      })
      .addCase(createPaiement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Reservation
    builder
      .addCase(fetchPaiementByReservation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaiementByReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPaiement = action.payload;
      })
      .addCase(fetchPaiementByReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Mes Paiements
    builder
      .addCase(fetchMesPaiements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMesPaiements.fulfilled, (state, action) => {
        state.loading = false;
        state.paiements = action.payload;
      })
      .addCase(fetchMesPaiements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch All (Admin)
    builder
      .addCase(fetchAllPaiements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPaiements.fulfilled, (state, action) => {
        state.loading = false;
        state.paiements = action.payload;
      })
      .addCase(fetchAllPaiements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updatePaiement.fulfilled, (state, action) => {
        const index = state.paiements.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.paiements[index] = action.payload;
        }
        state.currentPaiement = action.payload;
      });

    // Refund
    builder
      .addCase(refundPaiement.fulfilled, (state, action) => {
        const index = state.paiements.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.paiements[index] = action.payload;
        }
        state.currentPaiement = action.payload;
      });
  },
});

export const { clearError } = paiementSlice.actions;
export default paiementSlice.reducer;

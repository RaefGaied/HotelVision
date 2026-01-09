import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reservationService } from '../services/reservationService';

export const createReservation = createAsyncThunk(
  'reservations/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await reservationService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la réservation');
    }
  }
);

export const fetchMesReservations = createAsyncThunk(
  'reservations/fetchMes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationService.getMesReservations();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationService.cancel(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de l\'annulation');
    }
  }
);

export const finishReservation = createAsyncThunk(
  'reservations/finish',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationService.finish(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la terminaison');
    }
  }
);

export const fetchAllReservations = createAsyncThunk(
  'reservations/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reservationService.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchReservationById = createAsyncThunk(
  'reservations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const validateReservation = createAsyncThunk(
  'reservations/validate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationService.validate(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la validation');
    }
  }
);

const initialState = {
  reservations: [],
  loading: false,
  error: null,
};

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Mes
    builder
      .addCase(fetchMesReservations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMesReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchMesReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch All (Admin)
    builder
      .addCase(fetchAllReservations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchAllReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel
    builder
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      });

    // Validate
    builder
      .addCase(validateReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r._id === action.payload.reservation._id);
        if (index !== -1) {
          state.reservations[index] = action.payload.reservation;
        }
      });

    // Finish
    builder
      .addCase(finishReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      });
  },
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;

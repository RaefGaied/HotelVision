import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelService } from '../services/hotelService';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hotelService.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement');
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await hotelService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la création');
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await hotelService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la modification');
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/delete',
  async (id, { rejectWithValue }) => {
    try {
      await hotelService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors de la suppression');
    }
  }
);

const initialState = {
  hotels: [],
  currentHotel: null,
  loading: false,
  error: null,
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By ID
    builder
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels.push(action.payload);
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateHotel.fulfilled, (state, action) => {
        const index = state.hotels.findIndex(h => h._id === action.payload._id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
        state.currentHotel = action.payload;
      });

    // Delete
    builder
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter(h => h._id !== action.payload);
      });
  },
});

export const { clearError } = hotelSlice.actions;
export default hotelSlice.reducer;

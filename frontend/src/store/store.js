import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import hotelReducer from './hotelSlice';
import chambreReducer from './chambreSlice';
import serviceReducer from './serviceSlice';
import reservationReducer from './reservationSlice';
import factureReducer from './factureSlice';
import paiementReducer from './paiementSlice';
import clientReducer from './clientSlice';
import aiReducer from './aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotels: hotelReducer,
    chambres: chambreReducer,
    services: serviceReducer,
    reservations: reservationReducer,
    factures: factureReducer,
    paiements: paiementReducer,
    clients: clientReducer,
    ai: aiReducer,
  },
});

export default store;

import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convertir en millisecondes
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return true; // Considérer comme expiré en cas d'erreur
  }
};

// Intercepteur pour ajouter le token JWT et vérifier l'expiration
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.dispatch(logout());
      window.location.href = '/login';
      return Promise.reject(new Error('Token expiré'));
    }
    
    // Ajouter le token à la requête
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.dispatch(logout());
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden - accès non autorisé
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

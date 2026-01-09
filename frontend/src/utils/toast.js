/**
 * Toast Notification Utility
 * 
 * Provides convenient functions for showing toast notifications
 * throughout the application.
 * 
 * Usage:
 * import { notify } from '@/utils/toast';
 * 
 * notify.success('Réservation créée!');
 * notify.error('Une erreur est survenue');
 * notify.warning('Attention: Données non sauvegardées');
 * notify.info('Bienvenue!');
 */

import { toast } from 'react-toastify';

const notify = {
  success: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  // For async operations (loading message)
  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: "top-right",
      ...options
    });
  },

  // Update an existing toast (useful for loading -> success/error)
  update: (toastId, options = {}) => {
    toast.update(toastId, {
      ...options
    });
  }
};

export default notify;

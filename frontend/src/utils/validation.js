/**
 * Form Validation Utilities
 * 
 * Provides validation functions for all forms in the application.
 * Can be expanded to use Zod library in the future.
 * 
 * Usage:
 * import { validateEmail, validatePassword, validateForm } from '@/utils/validation';
 * 
 * const errors = validateForm(formData, 'login');
 * if (errors.length > 0) { show errors }
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email est requis";
  if (!emailRegex.test(email)) return "Email invalide";
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password) return "Mot de passe est requis";
  if (password.length < minLength) return `Minimum ${minLength} caractères`;
  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirm = (password, confirm) => {
  if (!confirm) return "Confirmation du mot de passe requise";
  if (password !== confirm) return "Les mots de passe ne correspondent pas";
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") return `${fieldName} est requis`;
  return null;
};

/**
 * Validate name field
 */
export const validateName = (name) => {
  if (!name) return "Nom est requis";
  if (name.trim().length < 2) return "Le nom doit avoir au moins 2 caractères";
  if (name.length > 100) return "Le nom ne peut pas dépasser 100 caractères";
  return null;
};

/**
 * Validate phone number (simple)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
  if (!phone) return null; // Optional field
  if (!phoneRegex.test(phone)) return "Numéro de téléphone invalide";
  if (phone.replace(/\D/g, "").length < 10) return "Numéro invalide (minimum 10 chiffres)";
  return null;
};

/**
 * Validate number (min, max)
 */
export const validateNumber = (value, fieldName, min = 0, max = Infinity) => {
  if (!value && value !== 0) return `${fieldName} est requis`;
  const num = parseFloat(value);
  if (isNaN(num)) return `${fieldName} doit être un nombre`;
  if (num < min) return `${fieldName} doit être supérieur à ${min}`;
  if (num > max) return `${fieldName} doit être inférieur à ${max}`;
  return null;
};

/**
 * Validate price field
 */
export const validatePrice = (price) => {
  if (!price && price !== 0) return "Prix est requis";
  const num = parseFloat(price);
  if (isNaN(num)) return "Prix doit être un nombre";
  if (num <= 0) return "Prix doit être supérieur à 0";
  return null;
};

/**
 * Validate date
 */
export const validateDate = (date) => {
  if (!date) return "Date est requise";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Date invalide";
  return null;
};

/**
 * Validate date range (departure > arrival)
 */
export const validateDateRange = (arrivalDate, departureDate) => {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  
  if (isNaN(arrival.getTime())) return "Date d'arrivée invalide";
  if (isNaN(departure.getTime())) return "Date de départ invalide";
  if (departure <= arrival) return "La date de départ doit être après la date d'arrivée";
  return null;
};

/**
 * Validate select field
 */
export const validateSelect = (value, fieldName) => {
  if (!value) return `${fieldName} est requis`;
  return null;
};

/**
 * Validate file upload
 */
export const validateFile = (file, maxSizeMB = 5) => {
  if (!file) return "Fichier est requis";
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) return `Le fichier ne doit pas dépasser ${maxSizeMB}MB`;
  return null;
};

/**
 * Form validation schemas
 */
export const ValidationSchemas = {
  login: {
    email: (value) => validateEmail(value),
    password: (value) => validatePassword(value, 6)
  },
  register: {
    nom: (value) => validateName(value),
    email: (value) => validateEmail(value),
    password: (value) => validatePassword(value, 8),
    passwordConfirm: (value, formData) => validatePasswordConfirm(formData.password, value)
  },
  userProfile: {
    nom: (value) => validateName(value),
    email: (value) => validateEmail(value),
    telephone: (value) => validatePhone(value)
  },
  chambre: {
    numero: (value) => validateRequired(value, "Numéro de chambre"),
    type: (value) => validateSelect(value, "Type"),
    capacite: (value) => validateNumber(value, "Capacité", 1, 10),
    prix: (value) => validatePrice(value)
  },
  reservation: {
    dateArrivee: (value) => validateDate(value),
    dateDepart: (value) => validateDate(value),
    dateRange: (arrivalDate, departureDate) => validateDateRange(arrivalDate, departureDate)
  }
};

/**
 * Validate entire form based on schema
 */
export const validateForm = (formData, schemaName) => {
  const schema = ValidationSchemas[schemaName];
  if (!schema) throw new Error(`Unknown validation schema: ${schemaName}`);

  const errors = {};
  
  for (const [fieldName, validator] of Object.entries(schema)) {
    const value = formData[fieldName];
    const error = validator(value, formData);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get error message for field
 */
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

/**
 * Sanitize input (trim whitespace)
 */
export const sanitizeInput = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
};

/**
 * Sanitize all form inputs
 */
export const sanitizeForm = (formData) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(formData)) {
    sanitized[key] = sanitizeInput(value);
  }
  return sanitized;
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateRequired,
  validateName,
  validatePhone,
  validateNumber,
  validatePrice,
  validateDate,
  validateDateRange,
  validateSelect,
  validateFile,
  ValidationSchemas,
  validateForm,
  hasErrors,
  getFieldError,
  sanitizeInput,
  sanitizeForm
};

const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  getAllUsers,
  getAllClients,
  toggleClientActivation,
  deleteAccount 
} = require('../controllers/userController');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Middleware for validation
const validateRegister = [
  check('nom', 'Le nom est obligatoire').not().isEmpty(),
  check('email', 'Email non valide').isEmail(),
  check('password', '6 caractères minimum').isLength({ min: 6 })
];

const validateLogin = [
  check('email', 'Email non valide').isEmail(),
  check('password', 'Mot de passe requis').exists()
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Erreurs de validation:', errors.array());
    console.log('📦 Body reçu:', req.body);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes
router.post('/test-register', (req, res) => {
  console.log('🧪 TEST REGISTER - Body reçu:', req.body);
  res.json({ success: true, received: req.body });
});
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes (Authenticated users)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount);

// Admin routes
router.get('/admin/users', [auth, admin], getAllUsers);
router.get('/admin/clients', [auth, admin], getAllClients);
router.put('/admin/clients/:clientId/toggle', [auth, admin], toggleClientActivation);

module.exports = router;
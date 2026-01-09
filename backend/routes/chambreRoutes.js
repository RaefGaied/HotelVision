const express = require('express');
const router = express.Router();
const { 
  getChambres, 
  getChambresByHotel,
  createChambre, 
  getChambreById, 
  updateChambre, 
  deleteChambre,
  updateStatutChambre
} = require('../controllers/chambreController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes - Get rooms
router.get('/', getChambres);
router.get('/hotel/:hotelId', getChambresByHotel);
router.get('/:id', getChambreById);

// Admin routes - Create, Update, Delete
router.post('/', [auth, admin], createChambre);
router.put('/:id', [auth, admin], updateChambre);
router.put('/:id/statut', [auth, admin], updateStatutChambre);
router.delete('/:id', [auth, admin], deleteChambre);

module.exports = router;
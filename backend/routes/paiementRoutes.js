const express = require('express');
const router = express.Router();
const { 
  createPaiement,
  getPaiementByReservation,
  getMesPaiements,
  getAllPaiements,
  updatePaiement,
  remboursePaiement
} = require('../controllers/paiementController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Client routes
router.post('/', auth, createPaiement);
router.get('/me', auth, getMesPaiements);
router.get('/reservation/:reservationId', auth, getPaiementByReservation);

// Admin routes
router.get('/', [auth, admin], getAllPaiements);
router.put('/:id', [auth, admin], updatePaiement);
router.put('/:id/rembourser', [auth, admin], remboursePaiement);

module.exports = router;

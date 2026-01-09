const express = require('express');
const router = express.Router();
const { 
  createReservation, 
  getMesReservations,
  getAllReservations,
  getReservationById,
  validerReservation,
  annulerReservation,
  terminerSejour
} = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Admin routes (must come BEFORE more general routes)
router.get('/all', [auth, admin], getAllReservations);
router.put('/:id/valider', [auth, admin], validerReservation);

// Client routes
router.post('/', auth, createReservation);
router.get('/me', auth, getMesReservations);
router.get('/:id', auth, getReservationById);
router.put('/:id/annuler', auth, annulerReservation);
router.put('/:id/terminer', auth, terminerSejour);

module.exports = router;
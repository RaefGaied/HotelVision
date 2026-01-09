const express = require('express');
const router = express.Router();
const { 
  genererFacture, 
  getFactureByReservation,
  getMesFactures,
  getAllFactures,
  updateFacture
} = require('../controllers/factureController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Client routes
router.get('/me', auth, getMesFactures);
router.get('/:resId', auth, getFactureByReservation);

// Admin routes
router.post('/', [auth, admin], genererFacture);
router.get('/', [auth, admin], getAllFactures);
router.put('/:id', [auth, admin], updateFacture);

module.exports = router;
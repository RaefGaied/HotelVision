const express = require('express');
const router = express.Router();
const { 
  getServices,
  getServicesByHotel,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleService
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/', getServices);
router.get('/hotel/:hotelId', getServicesByHotel);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', [auth, admin], createService);
router.put('/:id', [auth, admin], updateService);
router.put('/:id/toggle', [auth, admin], toggleService);
router.delete('/:id', [auth, admin], deleteService);

module.exports = router;

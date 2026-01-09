const express = require('express');
const router = express.Router();
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  generateHotelDescription
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/multer');

// Public routes - anyone can view hotels
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Admin routes - require authentication and admin role
router.post('/', [auth, admin, upload.single('image')], createHotel);
router.put('/:id', [auth, admin, upload.single('image')], updateHotel);
router.delete('/:id', [auth, admin], deleteHotel);

// AI route - generate description for existing hotel
router.post('/:id/generate-description', [auth, admin], generateHotelDescription);

module.exports = router;

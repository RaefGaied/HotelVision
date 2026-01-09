const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true 
  },
  adresse: { 
    type: String, 
    required: true 
  },
  ville: { 
    type: String, 
    required: true 
  },
  telephone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  etoiles: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  image: {
    type: String,
    default: null
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);

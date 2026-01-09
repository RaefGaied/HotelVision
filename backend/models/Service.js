const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  nom: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  prix: { 
    type: Number, 
    required: true 
  },
  actif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  reservation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    unique: true, 
    required: true 
  },
  montantTotal: { 
    type: Number, 
    required: true 
  },
  dateFacture: { 
    type: Date, 
    default: Date.now 
  },
  dateEmission: { 
    type: Date, 
    default: Date.now 
  },
  dateEcheance: {
    type: Date,
    required: false
  },
  estPayee: {
    type: Boolean,
    default: false
  },
  datePaiement: {
    type: Date,
    required: false
  },
  statut: {
    type: String,
    enum: ['EN_ATTENTE', 'PAYEE', 'PARTIELLE', 'REMBOURSEE'],
    default: 'EN_ATTENTE'
  },
  paiement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paiement'
  }
}, { timestamps: true });

module.exports = mongoose.model('Facture', factureSchema);
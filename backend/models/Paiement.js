const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
    unique: true
  },
  montant: { 
    type: Number, 
    required: true 
  },
  methodePaiement: { 
    type: String, 
    enum: ['ESPECES', 'CARTE_CREDIT', 'VIREMENT', 'CHEQUE'],
    required: true 
  },
  statut: {
    type: String,
    enum: ['EN_ATTENTE', 'VALIDEE', 'REJETEE', 'REMBOURSEE'],
    default: 'EN_ATTENTE'
  },
  datePaiement: { 
    type: Date, 
    default: Date.now 
  },
  referenceTransactionn: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Paiement', paiementSchema);

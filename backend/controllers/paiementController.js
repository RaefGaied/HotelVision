const Paiement = require('../models/Paiement');
const Facture = require('../models/Facture');
const Reservation = require('../models/Reservation');

// Create payment for reservation
exports.createPaiement = async (req, res) => {
  const { reservationId, montant, methodePaiement } = req.body;

  try {
    // Validate inputs
    if (!reservationId || !montant || !methodePaiement) {
      return res.status(400).json({ 
        msg: 'Données manquantes: reservationId, montant, methodePaiement requis' 
      });
    }

    if (montant <= 0) {
      return res.status(400).json({ 
        msg: 'Le montant doit être supérieur à 0' 
      });
    }

    // Validate payment method
    const validMethods = ['ESPECES', 'CARTE_CREDIT', 'VIREMENT', 'CHEQUE'];
    if (!validMethods.includes(methodePaiement)) {
      return res.status(400).json({ 
        msg: `Méthode de paiement invalide. Valides: ${validMethods.join(', ')}` 
      });
    }

    // Get reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ msg: 'Réservation non trouvée' });
    }

    // Check if payment already exists
    const paiementExistant = await Paiement.findOne({ reservation: reservationId });
    if (paiementExistant) {
      return res.status(400).json({ msg: 'Un paiement existe déjà pour cette réservation' });
    }

    // Get associated invoice
    const facture = await Facture.findOne({ reservation: reservationId });
    if (!facture) {
      return res.status(404).json({ msg: 'Aucune facture trouvée pour cette réservation' });
    }

    // Validate amount
    if (montant > facture.montantTotal) {
      return res.status(400).json({ 
        msg: `Montant invalide. Max: ${facture.montantTotal}€` 
      });
    }

    // Create payment
    const nouveauPaiement = new Paiement({
      reservation: reservationId,
      montant,
      methodePaiement,
      statut: 'VALIDEE'
    });

    await nouveauPaiement.save();

    // Update invoice status
    if (montant === facture.montantTotal) {
      facture.statut = 'PAYEE';
      facture.estPayee = true;
    } else if (montant > 0) {
      facture.statut = 'PARTIELLE';
      facture.estPayee = true; // Mark as having a payment, even if partial
    }
    facture.paiement = nouveauPaiement._id;
    facture.datePaiement = new Date();
    await facture.save();

    res.status(201).json({
      message: "Paiement enregistré avec succès",
      paiement: nouveauPaiement,
      factureStatut: facture.statut
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur création paiement", error: err.message });
  }
};

// Get payment by reservation
exports.getPaiementByReservation = async (req, res) => {
  try {
    const paiement = await Paiement.findOne({ reservation: req.params.resId })
      .populate({
        path: 'reservation',
        populate: [
          { path: 'client', select: 'nom email' },
          { path: 'chambre' }
        ]
      });

    if (!paiement) {
      return res.status(404).json({ msg: 'Aucun paiement trouvé' });
    }

    res.json(paiement);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération paiement", error: err.message });
  }
};

// Get my payments (Client)
exports.getMesPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate({
        path: 'reservation',
        match: { client: req.user.id },
        populate: [
          { path: 'client', select: 'nom email' },
          { path: 'chambre' }
        ]
      })
      .sort({ datePaiement: -1 });

    // Filter out payments where reservation is null
    const mesPaie = paiements.filter(p => p.reservation !== null);

    res.json(mesPaie);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération paiements", error: err.message });
  }
};

// Get all payments (Admin)
exports.getAllPaiements = async (req, res) => {
  try {
    const { statut } = req.query;
    let filter = {};

    if (statut) filter.statut = statut;

    const paiements = await Paiement.find(filter)
      .populate({
        path: 'reservation',
        populate: [
          { path: 'client', select: 'nom email' },
          { path: 'chambre' }
        ]
      })
      .sort({ datePaiement: -1 });

    res.json(paiements);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération paiements", error: err.message });
  }
};

// Update payment status (Admin only)
exports.updatePaiement = async (req, res) => {
  const { statut } = req.body;

  try {
    const validStatuts = ['EN_ATTENTE', 'VALIDEE', 'REJETEE', 'REMBOURSEE'];

    if (statut && !validStatuts.includes(statut)) {
      return res.status(400).json({
        msg: `Statut invalide. Doit être: ${validStatuts.join(', ')}`
      });
    }

    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('reservation');

    if (!paiement) {
      return res.status(404).json({ msg: 'Paiement non trouvé' });
    }

    // Update invoice status if payment status changes
    if (statut === 'REJETEE') {
      const facture = await Facture.findOne({ paiement: req.params.id });
      if (facture) {
        facture.statut = 'EN_ATTENTE';
        await facture.save();
      }
    }

    res.json({
      message: "Paiement mis à jour",
      paiement
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour paiement", error: err.message });
  }
};

// Refund payment (Admin only)
exports.remboursePaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      { statut: 'REMBOURSEE' },
      { new: true }
    ).populate('reservation');

    if (!paiement) {
      return res.status(404).json({ msg: 'Paiement non trouvé' });
    }

    // Update invoice status
    const facture = await Facture.findOne({ paiement: req.params.id });
    if (facture) {
      facture.statut = 'REMBOURSEE';
      await facture.save();
    }

    res.json({
      message: "Paiement remboursé avec succès",
      paiement
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur remboursement", error: err.message });
  }
};

const Facture = require('../models/Facture');
const Paiement = require('../models/Paiement');
const Reservation = require('../models/Reservation');

exports.genererFacture = async (req, res) => {
  const { reservationId } = req.body;

  try {
    const reservation = await Reservation.findById(reservationId)
      .populate('chambre')
      .populate('services');
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Réservation non trouvée' });
    }

    const factureExistante = await Facture.findOne({ reservation: reservationId });
    if (factureExistante) {
      return res.status(400).json({ msg: 'Une facture existe déjà pour cette réservation' });
    }

    const debut = new Date(reservation.datedebut);
    const fin = new Date(reservation.datefin);
    const nuits = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) || 1;

    let montantTotal = reservation.chambre.prix * nuits;

    if (reservation.services && reservation.services.length > 0) {
      const servicesCost = reservation.services.reduce((sum, service) => sum + service.prix, 0);
      montantTotal += servicesCost * nuits; // Services cost × nights
    }

    const nouvelleFacture = new Facture({
      reservation: reservationId,
      montantTotal,
      dateEcheance: new Date(fin.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after checkout
    });

    await nouvelleFacture.save();

    const facturePopulee = await nouvelleFacture.populate('reservation');

    res.status(201).json({
      message: "Facture générée avec succès",
      recapitulatif: {
        nuits,
        prixChambre: reservation.chambre.prix,
        servicesCost: reservation.services.reduce((sum, s) => sum + s.prix, 0) || 0,
        montantTotal,
        dateEcheance: nouvelleFacture.dateEcheance
      },
      facture: facturePopulee
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur génération facture", error: err.message });
  }
};

exports.getFactureByReservation = async (req, res) => {
  try {
    const facture = await Facture.findOne({ reservation: req.params.resId })
      .populate({
        path: 'reservation',
        populate: [
          { path: 'client', select: 'nom email' },
          { path: 'chambre', populate: { path: 'hotel' } },
          { path: 'services' }
        ]
      })
      .populate('paiement');

    if (!facture) {
      return res.status(404).json({ msg: 'Facture non trouvée' });
    }

    res.json(facture);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération facture", error: err.message });
  }
};

exports.getMesFactures = async (req, res) => {
  try {
    const mesReservations = await Reservation.find({ client: req.user.id })
      .populate([
        { path: 'client', select: 'nom email' },
        { path: 'chambre', populate: { path: 'hotel' } },
        { path: 'services' }
      ]);

    const reservationIds = mesReservations.map(r => r._id);
    const factures = await Facture.find({ reservation: { $in: reservationIds } })
      .populate('paiement')
      .sort({ dateEmission: -1 });

    const facturesAvecReservations = factures.map(facture => {
      const reservation = mesReservations.find(r => r._id.toString() === facture.reservation.toString());
      return {
        ...facture.toObject(),
        reservation: reservation
      };
    });

    res.json(facturesAvecReservations);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération factures", error: err.message });
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const { statut } = req.query;
    let filter = {};

    if (statut) filter.statut = statut;

    const factures = await Facture.find(filter)
      .populate({
        path: 'reservation',
        populate: [
          { path: 'client', select: 'nom email' },
          { path: 'chambre', populate: { path: 'hotel' } },
          { path: 'services' }
        ]
      })
      .populate('paiement')
      .sort({ dateEmission: -1 });

    res.json(factures);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération factures", error: err.message });
  }
};

exports.updateFacture = async (req, res) => {
  const { statut } = req.body;

  try {
    const validStatuts = ['EN_ATTENTE', 'PAYEE', 'PARTIELLE', 'REMBOURSEE'];
    
    if (statut && !validStatuts.includes(statut)) {
      return res.status(400).json({ 
        msg: `Statut invalide. Doit être: ${validStatuts.join(', ')}` 
      });
    }

    const facture = await Facture.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('reservation').populate('paiement');

    if (!facture) {
      return res.status(404).json({ msg: 'Facture non trouvée' });
    }

    res.json({
      message: 'Facture mise à jour',
      facture
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur mise à jour facture", error: err.message });
  }
};
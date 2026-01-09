const Chambre = require('../models/Chambre');
const Hotel = require('../models/Hotel');

// Get all rooms (Public)
exports.getChambres = async (req, res) => {
  try {
    const { hotel, type, statut } = req.query;
    let filter = {};

    if (hotel) filter.hotel = hotel;
    if (type) filter.type = type;
    if (statut) filter.statut = statut;

    const chambres = await Chambre.find(filter)
      .populate('hotel', 'nom adresse ville');
    
    res.json(chambres);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération chambres", error: err.message });
  }
};

// Get rooms by hotel
exports.getChambresByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const chambres = await Chambre.find({ hotel: hotelId })
      .populate('hotel', 'nom adresse');
    
    if (chambres.length === 0) {
      return res.status(404).json({ msg: 'Aucune chambre trouvée pour cet hôtel' });
    }

    res.json(chambres);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération chambres", error: err.message });
  }
};

// Create a new room (Admin only)
exports.createChambre = async (req, res) => {
  const { hotel, numero, type, capacite, prix, vue } = req.body;

  try {
    // Verify hotel exists
    const hotelExiste = await Hotel.findById(hotel);
    if (!hotelExiste) {
      return res.status(404).json({ msg: 'Hôtel non trouvé' });
    }

    const nouvelleChambre = new Chambre({
      hotel,
      numero,
      type,
      capacite,
      prix,
      vue
    });

    const chambreSauvegardee = await nouvelleChambre.save();
    const chambrePopulee = await chambreSauvegardee.populate('hotel', 'nom');

    res.status(201).json({
      message: "Chambre créée avec succès",
      chambre: chambrePopulee
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur création chambre", error: err.message });
  }
};

// Get room by ID
exports.getChambreById = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id)
      .populate('hotel', 'nom adresse');
    
    if (!chambre) return res.status(404).json({ msg: "Chambre non trouvée" });
    
    res.json(chambre);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Update room (Admin only)
exports.updateChambre = async (req, res) => {
  try {
    const chambreModifiee = await Chambre.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('hotel', 'nom');

    if (!chambreModifiee) {
      return res.status(404).json({ msg: "Chambre non trouvée" });
    }

    res.json({
      message: "Chambre mise à jour avec succès",
      chambre: chambreModifiee
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur modification chambre", error: err.message });
  }
};

// Delete room (Admin only)
exports.deleteChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findByIdAndDelete(req.params.id);
    
    if (!chambre) {
      return res.status(404).json({ msg: "Chambre non trouvée" });
    }

    res.json({ msg: "Chambre supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression chambre", error: err.message });
  }
};

// Update room status (Admin only)
exports.updateStatutChambre = async (req, res) => {
  const { statut } = req.body;

  try {
    const validStatuts = ['DISPONIBLE', 'OCCUPEE', 'MAINTENANCE'];
    
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ 
        msg: `Statut invalide. Doit être: ${validStatuts.join(', ')}` 
      });
    }

    const chambre = await Chambre.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );

    if (!chambre) {
      return res.status(404).json({ msg: "Chambre non trouvée" });
    }

    res.json({
      message: "Statut chambre modifié avec succès",
      chambre
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur modification statut", error: err.message });
  }
};
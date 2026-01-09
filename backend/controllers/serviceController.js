const Service = require('../models/Service');
const Hotel = require('../models/Hotel');

// Get services by hotel
exports.getServices = async (req, res) => {
  try {
    const { hotel, actif } = req.query;
    let filter = {};

    if (hotel) filter.hotel = hotel;
    if (actif !== undefined) filter.actif = actif === 'true';

    const services = await Service.find(filter)
      .populate('hotel', 'nom');

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération services", error: err.message });
  }
};

// Get services by hotel ID
exports.getServicesByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const services = await Service.find({ hotel: hotelId, actif: true })
      .populate('hotel', 'nom');

    if (services.length === 0) {
      return res.status(404).json({ msg: 'Aucun service trouvé' });
    }

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération services", error: err.message });
  }
};

// Create service (Admin only)
exports.createService = async (req, res) => {
  const { hotel, nom, description, prix } = req.body;

  try {
    // Verify hotel exists
    const hotelExiste = await Hotel.findById(hotel);
    if (!hotelExiste) {
      return res.status(404).json({ msg: 'Hôtel non trouvé' });
    }

    const nouveauService = new Service({
      hotel,
      nom,
      description,
      prix,
      actif: true
    });

    await nouveauService.save();

    // Add service to hotel's services array
    hotelExiste.services.push(nouveauService._id);
    await hotelExiste.save();

    const servicePopule = await nouveauService.populate('hotel', 'nom');

    res.status(201).json({
      message: "Service créé avec succès",
      service: servicePopule
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur création service", error: err.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('hotel', 'nom');

    if (!service) {
      return res.status(404).json({ msg: 'Service non trouvé' });
    }

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération service", error: err.message });
  }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('hotel', 'nom');

    if (!service) {
      return res.status(404).json({ msg: 'Service non trouvé' });
    }

    res.json({
      message: "Service mis à jour",
      service
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur mise à jour service", error: err.message });
  }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: 'Service non trouvé' });
    }

    // Remove service from hotel
    await Hotel.findByIdAndUpdate(
      service.hotel,
      { $pull: { services: req.params.id } }
    );

    res.json({ msg: 'Service supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression service", error: err.message });
  }
};

// Toggle service status
exports.toggleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: 'Service non trouvé' });
    }

    service.actif = !service.actif;
    await service.save();

    res.json({
      message: `Service ${service.actif ? 'activé' : 'désactivé'}`,
      service
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur toggle service", error: err.message });
  }
};

const Facture = require('../models/Facture');
const Reservation = require('../models/Reservation');

// Check and repair factures with missing reservations
exports.repairFactures = async (req, res) => {
  try {
    // Get all factures
    const allFactures = await Facture.find();
    
    let orphaned = 0;
    let fixed = 0;
    
    for (const facture of allFactures) {
      const reservation = await Reservation.findById(facture.reservation);
      
      if (!reservation) {
        await Facture.findByIdAndDelete(facture._id);
        orphaned++;
      } else if (!reservation.datedebut || !reservation.datefin) {
        console.warn(`Facture ${facture._id} has reservation without dates`);
      } else {
        fixed++;
      }
    }
    
    res.json({
      message: "Vérification terminée",
      total: allFactures.length,
      orphaned: orphaned,
      valid: fixed
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur réparation factures", error: err.message });
  }
};

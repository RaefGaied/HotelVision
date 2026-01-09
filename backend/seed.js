const mongoose = require("mongoose")
const User = require("./models/User")
const Hotel = require("./models/Hotel")
const Chambre = require("./models/Chambre")
const Service = require("./models/Service")
const Reservation = require("./models/Reservation")
const Facture = require("./models/Facture")
const Paiement = require("./models/Paiement")
require("dotenv").config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB connecté")
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB:", err.message)
    process.exit(1)
  }
}

const clearDatabase = async () => {
  try {
    // Drop entire collections to remove all documents and indexes
    const collections = ['factures', 'paiements', 'reservations', 'services', 'chambres', 'hotels', 'users'];
    
    for (const collName of collections) {
      try {
        await mongoose.connection.collection(collName).drop();
      } catch (err) {
        // Collection might not exist, that's okay
        if (err.code !== 26) {
          console.log(`⚠️  Warning dropping ${collName}:`, err.message);
        }
      }
    }
    
    console.log("🗑️  Base de données nettoyée");
  } catch (err) {
    console.error("❌ Erreur lors du nettoyage:", err.message);
  }
};

// Données réalistes pour BI
const prenoms = [
  "Marie",
  "Pierre",
  "Sophie",
  "Jean",
  "Francoise",
  "Michel",
  "Anne",
  "Luc",
  "Nathalie",
  "Philippe",
  "Isabelle",
  "Charles",
  "Veronique",
  "Alain",
  "Catherine",
  "Bernard",
  "Monique",
  "Patrick",
  "Christiane",
  "Jacques",
]
const noms = [
  "Dupont",
  "Martin",
  "Bernard",
  "Thomas",
  "Leclerc",
  "Durand",
  "Lefevre",
  "Laurent",
  "Garcia",
  "Moreau",
  "Simon",
  "Michel",
  "Leblanc",
  "Girard",
  "Antoine",
  "Arnould",
  "Auge",
  "Auger",
  "Aubry",
  "Aubert",
]
const villes = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Biarritz",
  "Cannes",
  "Antibes",
  "Courchevel",
  "Saint-Jean-Cap-Ferrat",
  "Deauville",
  "Honfleur",
  "Saint-Tropez",
  "Chamonix",
  "Megeve",
]
const methodePaiement = ["CARTE_CREDIT", "VIREMENT", "ESPECES", "CHEQUE"]
const statutReservation = ["VALIDEE", "EN_ATTENTE", "ANNULEE", "TERMINEE"]
const statutFacture = ["PAYEE", "EN_ATTENTE", "PARTIELLE"]
const statutPaiement = ["VALIDEE", "REJETEE", "EN_ATTENTE", "REMBOURSEE"]

const hotelNames = [
  "Grand Palais Luxury",
  "Horizon Resort & Spa",
  "Royal Crown Hotel",
  "Étoile Bleue Palace",
  "Riviera Élégance",
  "Le Premier Boutique",
  "Château Montagne",
  "Marina Vista Deluxe",
  "Prestige Continental",
  "Eden Garden Hotel",
  "Diamond Plaza",
  "Versailles Heritage",
  "Sunset Lounge Resort",
  "Crystal Bay Hotel",
  "Imperial Grandeur",
  "Metropolitan Luxe",
  "Essence of France",
  "Art Deco Dreams",
  "Alpine Paradise",
  "Côte d'Azur Prince",
]

const serviceNames = [
  "Petit-déjeuner continental",
  "Petit-déjeuner en chambre",
  "Accès Spa & Wellness",
  "Massage relaxant 60min",
  "Massage relaxant 90min",
  "Massage premium spécial",
  "Parking privé couvert",
  "Service voiturier 24h",
  "Transfert aéroport",
  "Room service 24h",
  "Champagne & amuse-bouches",
  "Dîner gastronomique",
  "Excursion privée guidée",
  "Location vélo électrique",
  "Location voiture",
  "Cours de yoga privé",
  "Séance fitness personnel",
  "Baby-sitting professionnel",
  "Bouquet de fleurs",
  "Préparation spéciale chambre",
]

function generateEmail(prenom, nom) {
  return `${prenom.toLowerCase()}.${nom.toLowerCase()}@email.com`
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const seedDatabase = async () => {
  try {
    await connectDB()
    await clearDatabase()

    console.log("👥 Génération des utilisateurs (100+)...")
    const clients = []

    // Admin
    const admin = await User.create({
      nom: "Admin Hôtel",
      email: "admin@hotelgroup.com",
      password: "admin123",
      role: "admin",
      actif: true,
    })

    // Créer 100+ clients
    for (let i = 0; i < 100; i++) {
      const prenom = getRandomElement(prenoms)
      const nom = getRandomElement(noms)
      const client = await User.create({
        nom: `${prenom} ${nom}`,
        email: generateEmail(prenom, nom),
        password: "client123",
        role: "client",
        actif: Math.random() > 0.1, // 90% actifs
      })
      clients.push(client)
    }
    console.log(`✅ ${clients.length} clients créés`)

    console.log("🏨 Génération des hôtels (20)...")
    const hotels = []
    for (let i = 0; i < 20; i++) {
      const ville = getRandomElement(villes)
      const hotel = await Hotel.create({
        nom: getRandomElement(hotelNames),
        adresse: `${getRandomInt(1, 500)} Rue de la ${getRandomElement(["Paix", "Liberté", "Joie", "Victoire", "République"])}`,
        ville: ville,
        telephone: `+33 ${getRandomInt(1, 9)} ${getRandomInt(10000000, 99999999)}`,
        email: `contact@${hotelNames[i].toLowerCase().replace(/\s+/g, "-")}.com`,
        etoiles: getRandomInt(3, 5),
        description: `Hôtel de luxe situé à ${ville}, offrant des services de première classe avec spa, restaurants et équipements de loisirs haut de gamme.`,
        admin: admin._id,
        services: [],
      })
      hotels.push(hotel)
    }
    console.log(`✅ ${hotels.length} hôtels créés`)

    console.log("🛎️  Génération des services (150+)...")
    let totalServices = 0
    for (const hotel of hotels) {
      const servicesHotel = []
      // 8-12 services par hôtel
      const nombreServices = getRandomInt(8, 12)

      for (let i = 0; i < nombreServices; i++) {
        const serviceName = getRandomElement(serviceNames)
        const prixBase = getRandomInt(20, 250)
        const service = await Service.create({
          hotel: hotel._id,
          nom: serviceName,
          description: `Service premium: ${serviceName}`,
          prix: prixBase,
          actif: Math.random() > 0.15, // 85% actifs
        })
        servicesHotel.push(service._id)
        totalServices++
      }

      hotel.services = servicesHotel
      await hotel.save()
    }
    console.log(`✅ ${totalServices} services créés`)

    console.log("🛏️  Génération des chambres (500+)...")
    const typesChambres = ["SIMPLE", "DOUBLE", "SUITE", "DELUXE"]
    const vuesChambres = ["jardin", "ville", "mer", "montagne", "cour intérieure", "panoramique"]
    const statutChambres = ["DISPONIBLE", "OCCUPEE", "MAINTENANCE"]

    let totalChambres = 0
    for (const hotel of hotels) {
      const chambresParHotel = getRandomInt(25, 35) // Plus de chambres par hôtel

      for (let i = 1; i <= chambresParHotel; i++) {
        const type = getRandomElement(typesChambres)
        const prix = getRandomInt(80, 500)
        const etage = Math.floor(i / 10) + 1
        const numero = String(etage) + String(i % 10 || 10).padStart(2, "0")

        await Chambre.create({
          numero: numero,
          type: type,
          capacite: type === "SIMPLE" ? 1 : type === "DOUBLE" ? 2 : type === "SUITE" ? 3 : 4,
          prix: prix,
          vue: getRandomElement(vuesChambres),
          statut: getRandomElement(statutChambres),
          hotel: hotel._id,
        })
        totalChambres++
      }
    }
    console.log(`✅ ${totalChambres} chambres créées`)

    console.log("📅 Génération des réservations (200+)...")
    const chambres = await Chambre.find().populate("hotel")
    const reservations = []
    const facturesData = []
    const paiementsData = []

    for (let i = 0; i < 200; i++) {
      const client = getRandomElement(clients)
      const chambre = getRandomElement(chambres)
      const baseDate = new Date("2025-01-01")
      const offsetJours = getRandomInt(-90, 90)

      const datedebut = new Date(baseDate)
      datedebut.setDate(baseDate.getDate() + offsetJours)

      const duree = getRandomInt(1, 7)
      const datefin = new Date(datedebut)
      datefin.setDate(datedebut.getDate() + duree)

      const servicesHotel = await Service.find({ hotel: chambre.hotel._id, actif: true })
      const servicesSelectionnes = []
      const nombreServices = getRandomInt(0, Math.min(3, servicesHotel.length))

      for (let j = 0; j < nombreServices; j++) {
        const service = getRandomElement(servicesHotel)
        if (!servicesSelectionnes.includes(service._id)) {
          servicesSelectionnes.push(service._id)
        }
      }

      // Déterminer le statut
      const maintenant = new Date()
      let statut = getRandomElement(statutReservation)
      if (datefin < maintenant) {
        statut = Math.random() > 0.3 ? "TERMINEE" : "ANNULEE"
      }

      // Calculer montant
      const montantChambre = chambre.prix * duree
      const montantServices = servicesSelectionnes.reduce((sum, serviceId) => {
        const service = servicesHotel.find((s) => s._id.toString() === serviceId.toString())
        return sum + (service ? service.prix * duree : 0)
      }, 0)
      const montantTotal = montantChambre + montantServices

      const reservation = await Reservation.create({
        client: client._id,
        chambre: chambre._id,
        datedebut: datedebut,
        datefin: datefin,
        services: servicesSelectionnes,
        montantTotal: montantTotal,
        statut: statut,
      })

      reservations.push(reservation)

      // Créer facture associée
      if (statut === "VALIDEE" || statut === "TERMINEE") {
        const dateFacture = new Date(datedebut)
        dateFacture.setDate(datedebut.getDate() + 1)

        const facture = await Facture.create({
          reservation: reservation._id,
          montantTotal: montantTotal,
          dateFacture: dateFacture,
          estPayee: Math.random() > 0.15, // 85% payées pour atteindre 100+ paiements
          statut: Math.random() > 0.2 ? "PAYEE" : Math.random() > 0.5 ? "EN_ATTENTE" : "PARTIELLE",
          dateEmission: dateFacture,
        })
        facturesData.push(facture)

        // Créer paiement si facture payée
        if (facture.estPayee) {
          const montantPaye = facture.statut === "PARTIELLE" ? montantTotal * 0.7 : montantTotal
          const paiement = await Paiement.create({
            reservation: reservation._id,
            montant: montantPaye,
            methodePaiement: getRandomElement(methodePaiement),
            statut: "VALIDEE",
            datePaiement: new Date(dateFacture.getTime() + getRandomInt(1, 7) * 24 * 60 * 60 * 1000),
          })
          facturesData[facturesData.length - 1].paiement = paiement._id
          facturesData[facturesData.length - 1].datePaiement = paiement.datePaiement
          await facturesData[facturesData.length - 1].save()
          paiementsData.push(paiement)
        }
      }
    }
    console.log(`✅ ${reservations.length} réservations créées`)
    console.log(`✅ ${facturesData.length} factures créées`)
    console.log(`✅ ${paiementsData.length} paiements créés`)

    console.log("\n🎉 ==========================================")
    console.log("🎉 BASE DE DONNÉES REMPLIE AVEC SUCCÈS !")
    console.log("🎉 ==========================================\n")
    console.log(`📊 Statistiques complètes:`)
    console.log(`   - ${hotels.length} hôtels`)
    console.log(`   - ${totalChambres} chambres`)
    console.log(`   - ${totalServices} services`)
    console.log(`   - ${clients.length} clients`)
    console.log(`   - ${reservations.length} réservations`)
    console.log(`   - ${facturesData.length} factures`)
    console.log(`   - ${paiementsData.length} paiements\n`)
    console.log(`🔐 Compte admin: admin@hotelgroup.com / admin123\n`)

    process.exit(0)
  } catch (err) {
    console.error("❌ Erreur lors du seeding:", err.message)
    console.error(err)
    process.exit(1)
  }
}

seedDatabase()

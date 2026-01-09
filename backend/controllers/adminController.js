const Hotel = require('../models/Hotel');
const Facture = require('../models/Facture');
const Chambre = require('../models/Chambre');
const Reservation = require('../models/Reservation');
const Service = require('../models/Service');

// Get dashboard stats for admin
exports.getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Get all hotels managed by this admin
    const hotels = await Hotel.find({ admin: adminId });
    const hotelIds = hotels.map(h => h._id);

    // Revenue total
    const factures = await Facture.find().populate({
      path: 'reservation',
      populate: { path: 'chambre' }
    });
    const totalCA = factures.reduce((sum, f) => sum + f.montantTotal, 0);

    // Chambres total
    const totalChambres = await Chambre.countDocuments({ hotel: { $in: hotelIds } });
    const occupees = await Chambre.countDocuments({
      hotel: { $in: hotelIds },
      statut: 'OCCUPEE'
    });
    const tauxOccupation = totalChambres > 0 ? (occupees / totalChambres) * 100 : 0;

    // Reservations in progress
    const reservationsEnCours = await Reservation.countDocuments({
      statut: { $in: ['EN_ATTENTE', 'VALIDEE'] }
    });

    // Total clients
    const clientsUniques = await Reservation.distinct('client');

    res.json({
      revenuTotal: totalCA,
      nombreChambres: totalChambres,
      chambresOccupees: occupees,
      tauxOccupation: tauxOccupation.toFixed(2),
      reservationsEnCours,
      totalClients: clientsUniques.length,
      message: "Statistiques récupérées avec succès"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur statistiques", error: err.message });
  }
};

// Create a new hotel
exports.createHotel = async (req, res) => {
  const { nom, adresse, ville, telephone, email, description, etoiles, chambres } = req.body;

  try {
    // Générer une description IA si non fournie
    let descriptionFinale = description;

    if (!description || description.trim() === '') {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.8,
            topP: 1,
            topK: 32,
            maxOutputTokens: 1024,
          },
        });

        const prompt = `
    En tant que rédacteur professionnel pour l'hôtellerie de luxe, crée une description attrayante et détaillée pour cet hôtel :

    INFORMATIONS HÔTEL:
    - Nom: ${nom}
    - Ville: ${ville}
    - Étoiles: ${etoiles}
    - Adresse: ${adresse}
    - Téléphone: ${telephone}
    - Email: ${email}

    Génère une description marketing (200-300 mots) qui :
    1. Met en valeur l'emplacement et les caractéristiques uniques de l'hôtel
    2. Évoque une expérience mémorable et luxueuse
    3. Utilise un langage élégant et persuasif
    4. Mentionne les avantages pratiques et services typiques
    5. Adapte le ton à la catégorie ${etoiles} étoiles
    6. Inclut des suggestions d'activités locales à ${ville}

    Format de réponse JSON :
    {
      "description": "description marketing complète",
      "highlights": ["point fort 1", "point fort 2", "point fort 3"],
      "targetAudience": "type de client idéal pour cet hôtel"
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiDescription = JSON.parse(jsonMatch[0]);
            descriptionFinale = aiDescription.description;
            console.log('✅ Description IA générée pour l\'hôtel:', nom);
          }
        } catch (parseError) {
          console.log('⚠️ Erreur parsing IA, utilisation description par défaut');
          descriptionFinale = `Hôtel ${etoiles} étoiles situé à ${ville}. Offrant un hébergement de qualité avec des services modernes et un confort exceptionnel.`;
        }
      } catch (aiError) {
        console.log('❌ Erreur génération description IA:', aiError.message);
        descriptionFinale = `Hôtel ${etoiles} étoiles situé à ${ville}. Offrant un hébergement de qualité avec des services modernes et un confort exceptionnel.`;
      }
    }

    // Créer l'hôtel
    const nouvelHotel = new Hotel({
      nom,
      adresse,
      ville,
      telephone,
      email,
      description: descriptionFinale,
      etoiles,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      admin: req.user.id
    });

    await nouvelHotel.save();

    // Créer les chambres si fournies
    if (chambres && Array.isArray(chambres) && chambres.length > 0) {
      const chambresAvecHotel = chambres.map(chambre => ({
        ...chambre,
        hotel: nouvelHotel._id
      }));

      await Chambre.insertMany(chambresAvecHotel);
    }

    // Récupérer l'hôtel avec ses chambres
    const hotelComplet = await Hotel.findById(nouvelHotel._id)
      .populate('services')
      .populate('admin', 'nom email');

    const chambresHotel = await Chambre.find({ hotel: nouvelHotel._id });

    res.status(201).json({
      message: "Hôtel créé avec succès",
      hotel: hotelComplet,
      chambres: chambresHotel
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur création hôtel", error: err.message });
  }
};

// Get all hotels managed by admin
exports.getHotels = async (req, res) => {
  try {
    // If user is admin, show only their hotels. Otherwise show all (public view)
    const query = req.user ? { admin: req.user.id } : {};
    const hotels = await Hotel.find(query)
      .populate('services')
      .populate('admin', 'nom email');

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération hôtels", error: err.message });
  }
};

// Get hotel by ID (public route)
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('services')
      .populate('admin', 'nom email');

    if (!hotel) return res.status(404).json({ msg: 'Hôtel non trouvé' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération hôtel", error: err.message });
  }
};

// Update hotel
exports.updateHotel = async (req, res) => {
  try {
    const updateData = { $set: req.body };

    // Add image if file was uploaded
    if (req.file) {
      updateData.$set.image = `/uploads/${req.file.filename}`;
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('services');

    if (!hotel) return res.status(404).json({ msg: 'Hôtel non trouvé' });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ message: "Erreur modification hôtel", error: err.message });
  }
};

// Generate AI description for existing hotel
exports.generateHotelDescription = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotelData = req.body; // Données du formulaire pour nouvel hôtel

    let hotel;

    if (hotelId) {
      // Cas 1: Hôtel existant
      const Hotel = require('../models/Hotel');
      hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return res.status(404).json({ msg: "Hôtel non trouvé" });
      }
    } else {
      // Cas 2: Nouvel hôtel - utiliser les données du formulaire
      hotel = hotelData;

      if (!hotel || !hotel.nom || !hotel.ville || !hotel.etoiles) {
        return res.status(400).json({ msg: "Données de l'hôtel incomplètes" });
      }
    }

    // Générer une description IA
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.8,
          topP: 1,
          topK: 32,
          maxOutputTokens: 1024,
        },
      });

      const prompt = `
    En tant que rédacteur professionnel pour l'hôtellerie de luxe, crée une description attrayante et détaillée pour cet hôtel :

    INFORMATIONS HÔTEL:
    - Nom: ${hotel.nom}
    - Ville: ${hotel.ville}
    - Étoiles: ${hotel.etoiles}
    - Adresse: ${hotel.adresse}
    - Téléphone: ${hotel.telephone}
    - Email: ${hotel.email}
    - Description actuelle: ${hotel.description || 'Non fournie'}

    Génère une description marketing améliorée (200-300 mots) qui :
    1. Met en valeur l'emplacement et les caractéristiques uniques de l'hôtel
    2. Évoque une expérience mémorable et luxueuse
    3. Utilise un langage élégant et persuasif
    4. Mentionne les avantages pratiques et services typiques
    5. Adapte le ton à la catégorie ${hotel.etoiles} étoiles
    6. Inclut des suggestions d'activités locales à ${hotel.ville}

    Format de réponse JSON :
    {
      "description": "description marketing complète",
      "highlights": ["point fort 1", "point fort 2", "point fort 3"],
      "targetAudience": "type de client idéal pour cet hôtel"
    }
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Tenter de parser le JSON de plusieurs manières
        let aiDescription = null;

        // Méthode 1: chercher un JSON complet
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            aiDescription = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.log('❌ Erreur parsing JSON complet:', e.message);
          }
        }

        // Méthode 2: chercher le champ description spécifiquement
        if (!aiDescription) {
          const descMatch = text.match(/["']description["']\s*:\s*["']([^"']+)["']/);
          if (descMatch) {
            aiDescription = {
              description: descMatch[1],
              highlights: [],
              targetAudience: "Clientèle générale"
            };
            console.log('✅ Description extraite avec fallback');
          }
        }

        // Méthode 3: utiliser le texte brut si tout échoue
        if (!aiDescription) {
          // Nettoyer le texte et l'utiliser comme description
          const cleanText = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/"/g, '')
            .trim();

          if (cleanText.length > 50) {
            aiDescription = {
              description: cleanText.substring(0, 500),
              highlights: [],
              targetAudience: "Clientèle générale"
            };
            console.log('✅ Description générée à partir du texte brut');
          }
        }

        if (aiDescription) {
          if (hotelId) {
            // Cas 1: Hôtel existant - mettre à jour dans la base
            const Hotel = require('../models/Hotel');
            const updatedHotel = await Hotel.findByIdAndUpdate(
              hotelId,
              { description: aiDescription.description },
              { new: true }
            );

            console.log('✅ Description IA générée et mise à jour pour l\'hôtel:', hotel.nom);

            res.json({
              message: "Description IA générée avec succès",
              hotel: updatedHotel,
              aiDescription: aiDescription
            });
          } else {
            // Cas 2: Nouvel hôtel - retourner seulement la description
            console.log('✅ Description IA générée pour nouvel hôtel:', hotel.nom);

            res.json({
              message: "Description IA générée avec succès",
              description: aiDescription.description,
              aiDescription: aiDescription
            });
          }
        } else {
          throw new Error("Impossible d'extraire la description de la réponse IA");
        }
      } catch (parseError) {
        console.log('⚠️ Erreur parsing IA:', parseError.message);
        res.status(500).json({ msg: "Erreur lors du traitement de la réponse IA" });
      }
    } catch (aiError) {
      console.log('❌ Erreur génération description IA:', aiError.message);
      res.status(500).json({
        msg: "Erreur lors de la génération de la description IA",
        error: aiError.message
      });
    }
  } catch (error) {
    console.error("Erreur génération description hôtel:", error);
    res.status(500).json({
      msg: "Erreur lors de la génération de la description",
      error: error.message
    });
  }
};

// Analyze sentiment of reviews
exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ msg: "Texte à analyser requis" });
    }

    // Analyse de sentiments avec Google Gemini
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.3,
          topP: 1,
          topK: 32,
          maxOutputTokens: 500,
        },
      });

      const prompt = `
    Analyse le sentiment de cet avis client pour un hôtel et donne une évaluation détaillée.

    TEXTE À ANALYSER:
    "${text}"

    Format de réponse JSON :
    {
      "sentiment": "positif|negatif|neutre",
      "score": -1 à 1,
      "confidence": 0 à 1,
      "keywords": ["mot1", "mot2", "mot3"],
      "summary": "Résumé bref de l'analyse",
      "recommendations": ["suggestion1", "suggestion2"]
    }
    
    Échelles de score :
    -1 à -0.3 : Très négatif
    -0.3 to -0.1 : Négatif
    -0.1 to 0.1 : Neutre
    0.1 to 0.3 : Positif
    0.3 to 1 : Très positif
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const sentimentAnalysis = JSON.parse(jsonMatch[0]);

          console.log('✅ Analyse de sentiments IA générée');

          res.json({
            message: "Analyse de sentiments effectuée avec succès",
            analysis: sentimentAnalysis
          });
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (parseError) {
        console.log('⚠️ Erreur parsing IA, analyse par défaut');

        // Analyse de sentiments simple par mots-clés
        const positiveWords = ['excellent', 'superbe', 'magnifique', 'parfait', 'formidable', 'agréable', 'confortable', 'propre', 'sympathique'];
        const negativeWords = ['mauvais', 'horrible', 'terrible', 'décevant', 'sale', 'bruyant', 'inconfortable', 'malpropre', 'désagréable'];

        const words = text.toLowerCase().split(/\s+/);
        const positiveCount = words.filter(word => positiveWords.includes(word)).length;
        const negativeCount = words.filter(word => negativeWords.includes(word)).length;

        let sentiment = 'neutre';
        let score = 0;

        if (positiveCount > negativeCount) {
          sentiment = 'positif';
          score = Math.min(0.5 + (positiveCount - negativeCount) * 0.1, 1);
        } else if (negativeCount > positiveCount) {
          sentiment = 'negatif';
          score = Math.max(-0.5 - (negativeCount - positiveCount) * 0.1, -1);
        }

        const fallbackAnalysis = {
          sentiment: sentiment,
          score: score,
          confidence: 0.6,
          keywords: words.slice(0, 5),
          summary: `Analyse simple : ${positiveCount} mots positifs, ${negativeCount} mots négatifs`,
          recommendations: sentiment === 'positif' ?
            ['Continuer la qualité actuelle', 'Mettre en avant les points forts'] :
            ['Améliorer les points faibles', 'Prendre en compte les retours clients']
        };

        res.json({
          message: "Analyse de sentiments effectuée avec succès",
          analysis: fallbackAnalysis
        });
      }
    } catch (aiError) {
      console.log('❌ Erreur analyse sentiments IA:', aiError.message);
      res.status(500).json({
        msg: "Erreur lors de l'analyse de sentiments",
        error: aiError.message
      });
    }
  } catch (error) {
    console.error("Erreur analyse sentiments:", error);
    res.status(500).json({
      msg: "Erreur lors de l'analyse de sentiments",
      error: error.message
    });
  }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ msg: 'Hôtel non trouvé' });

    // Delete associated rooms and services
    await Chambre.deleteMany({ hotel: req.params.id });
    await Service.deleteMany({ hotel: req.params.id });

    res.json({ msg: 'Hôtel et ses données associées supprimés avec succès' });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression hôtel", error: err.message });
  }
};
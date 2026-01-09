const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    console.error("Erreur : La clé API Gemini n'est pas définie dans les variables d'environnement");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
                maxOutputTokens: 4096,
            },
        });
        console.log("\nConnexion au modèle établie avec succès ! ✅");
        return model;
    } catch (error) {
        console.error("Erreur lors de l'initialisation du modèle Gemini :", error.message);
        throw error;
    }
};

// Helper function to analyze user preferences
function analyzeUserPreferences(pastReservations, currentPreferences) {
    const preferences = {
        preferredTypes: [],
        avgBudget: 0,
        frequentServices: [],
        preferredHotels: []
    };

    if (pastReservations && pastReservations.length > 0) {
        const types = pastReservations.map(r => r.chambre?.type).filter(Boolean);
        preferences.preferredTypes = [...new Set(types)];

        const prices = pastReservations.map(r => r.chambre?.prix).filter(Boolean);
        preferences.avgBudget = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

        const allServices = pastReservations.flatMap(r => r.services || []);
        preferences.frequentServices = [...new Set(allServices)];

        const hotels = pastReservations.map(r => r.chambre?.hotel?.nom).filter(Boolean);
        preferences.preferredHotels = [...new Set(hotels)];
    }

    // Merge with current preferences
    if (currentPreferences) {
        if (currentPreferences.roomType) preferences.preferredTypes.push(currentPreferences.roomType);
        if (currentPreferences.budget) preferences.avgBudget = parseInt(currentPreferences.budget);
        if (currentPreferences.city) preferences.preferredCity = currentPreferences.city;
    }

    return preferences;
}

// Fallback function for recommendations
function generateFallbackRecommendations(availableRooms, userPreferences) {
    return {
        recommendations: availableRooms.slice(0, 3).map(room => ({
            roomId: room._id,
            roomNumber: room.numero,
            hotelName: room.hotel.nom,
            reason: `Chambre ${room.type} idéale pour vos besoins`,
            score: 85,
            highlights: [`${room.type} spacieux`, `Vue ${room.vue || 'agréable'}`, `${room.hotel.etoiles} étoiles`]
        }))
    };
}

// Fallback function for descriptions
function generateFallbackDescription(room) {
    return {
        description: `Chambre ${room.type} élégante et confortable, idéale pour un séjour inoubliable. Cette chambre offre tout le confort nécessaire avec une capacité de ${room.capacite} personnes et une vue magnifique.`,
        highlights: [`${room.type} spacieux`, `Vue ${room.vue || 'agréable'}`, `${room.hotel.etoiles} étoiles`],
        targetAudience: "Voyageurs recherchant confort et qualité"
    };
}

// Generate personalized room recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const { userId, preferences } = req.body;

        if (!userId || userId === 'guest') {
            return res.status(400).json({ msg: "ID utilisateur requis" });
        }

        // Get user's reservation history to understand preferences
        const Reservation = require('../models/Reservation');
        const User = require('../models/User');
        const Chambre = require('../models/Chambre');
        const Hotel = require('../models/Hotel');

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé" });
        }

        // Get user's past reservations
        const pastReservations = await Reservation.find({ client: userId })
            .populate({
                path: 'chambre',
                populate: { path: 'hotel' }
            })
            .populate('services');

        // Analyze user preferences from history
        const userPreferences = analyzeUserPreferences(pastReservations, preferences);

        // Get available rooms
        const availableRooms = await Chambre.find({ statut: 'DISPONIBLE' })
            .populate('hotel')
            .limit(20);

        // Generate AI recommendations
        const aiModel = getModel();

        const prompt = `
    En tant qu'expert hôtelier, analyse les préférences de ce client et recommande-lui les chambres les plus adaptées :

    PROFIL CLIENT:
    - Nom: ${user.nom}
    - Email: ${user.email}
    - Historique de réservations: ${pastReservations.length} réservations

    PRÉFÉRENCES ANALYSÉES:
    - Types de chambres préférés: ${userPreferences.preferredTypes.join(', ') || 'Non défini'}
    - Budget moyen: ${userPreferences.avgBudget || 'Non défini'}€
    - Services fréquents: ${userPreferences.frequentServices.join(', ') || 'Non défini'}
    - Types d'hôtels préférés: ${userPreferences.preferredHotels.join(', ') || 'Non défini'}

    CHAMBRES DISPONIBLES:
    ${availableRooms.map(room => `
    - Chambre ${room.numero} (${room.type}) - ${room.hotel.nom}
      Prix: ${room.prix}€/nuit
      Capacité: ${room.capacite} personnes
      Vue: ${room.vue || 'Non spécifiée'}
      Hôtel: ${room.hotel.etoiles} étoiles - ${room.hotel.ville}
    `).join('\n')}

    PRÉFÉRENCES SUPPLÉMENTAIRES (si fournies):
    ${preferences ? JSON.stringify(preferences, null, 2) : 'Aucune'}

    Fournis 3 recommandations personnalisées avec explications détaillées.
    Format de réponse JSON :
    {
      "recommendations": [
        {
          "roomId": "room_id",
          "roomNumber": "numéro_chambre",
          "hotelName": "nom_hôtel",
          "reason": "explication détaillée de pourquoi cette chambre convient",
          "score": 95,
          "highlights": ["point fort 1", "point fort 2"]
        }
      ]
    }
    `;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let recommendations;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Format de réponse invalide");
            }
        } catch (error) {
            recommendations = generateFallbackRecommendations(availableRooms, userPreferences);
        }

        res.json({
            success: true,
            recommendations: recommendations.recommendations || recommendations,
            userProfile: {
                totalReservations: pastReservations.length,
                preferences: userPreferences
            }
        });

    } catch (error) {
        console.error("Erreur génération recommandations:", error);
        res.status(500).json({
            msg: "Erreur lors de la génération des recommandations",
            error: error.message
        });
    }
};

// Generate intelligent room description
exports.generateRoomDescription = async (req, res) => {
    try {
        const { roomId } = req.params;

        const Chambre = require('../models/Chambre');
        const Hotel = require('../models/Hotel');

        const room = await Chambre.findById(roomId).populate('hotel');
        if (!room) {
            return res.status(404).json({ msg: "Chambre non trouvée" });
        }

        const aiModel = getModel();

        const prompt = `
    En tant que rédacteur professionnel pour l'hôtellerie de luxe, crée une description attrayante et détaillée pour cette chambre :

    INFORMATIONS CHAMBRE:
    - Type: ${room.type}
    - Numéro: ${room.numero}
    - Capacité: ${room.capacite} personnes
    - Prix: ${room.prix}€/nuit
    - Vue: ${room.vue || 'Vue standard'}

    INFORMATIONS HÔTEL:
    - Nom: ${room.hotel.nom}
    - Ville: ${room.hotel.ville}
    - Étoiles: ${room.hotel.etoiles}
    - Description: ${room.hotel.description || 'Hôtel de charme'}

    Génère une description marketing (150-200 mots) qui :
    1. Met en valeur les caractéristiques uniques de la chambre
    2. Évoque une expérience mémorable
    3. Utilise un langage élégant et persuasif
    4. Mentionne les avantages pratiques
    5. Adapte le ton au type de chambre (${room.type})

    Format de réponse JSON :
    {
      "description": "description marketing complète",
      "highlights": ["point fort 1", "point fort 2", "point fort 3"],
      "targetAudience": "type de client idéal pour cette chambre"
    }
    `;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let description;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                description = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Format de réponse invalide");
            }
        } catch (error) {
            description = generateFallbackDescription(room);
        }

        res.json({
            success: true,
            roomId: room._id,
            ...description
        });

    } catch (error) {
        console.error("Erreur génération description:", error);
        res.status(500).json({
            msg: "Erreur lors de la génération de la description",
            error: error.message
        });
    }
};

// Chatbot for customer assistance
exports.chatbotAssistance = async (req, res) => {
    try {
        const { message, userId, context } = req.body;

        if (!message) {
            return res.status(400).json({ msg: "Message requis" });
        }

        // Get user context if available
        let userContext = "";
        if (userId && userId !== 'guest') {
            const User = require('../models/User');
            const Reservation = require('../models/Reservation');

            const user = await User.findById(userId);
            const reservations = await Reservation.find({ client: userId }).countDocuments();

            userContext = `
      CONTEXTE CLIENT:
      - Nom: ${user?.nom || 'Client'}
      - Email: ${user?.email || 'Non renseigné'}
      - Réservations précédentes: ${reservations}
      - Statut: ${user?.actif ? 'Actif' : 'Inactif'}
      `;
        }

        const aiModel = getModel();

        const prompt = `
    Tu es un assistant virtuel professionnel pour HôtelApp, une plateforme de réservation hôtelière.

    ${userContext}

    CONTEXTE ACTUEL:
    ${context ? `Page actuelle: ${context}` : ''}

    RÈGLES:
    1. Sois professionnel, amical et précis
    2. Réponds en français uniquement
    3. Adapte tes réponses au contexte client
    4. Pour les questions techniques, oriente vers le support approprié
    5. Pour les réservations, guide vers le processus en ligne
    6. Sois concis mais complet

    QUESTION CLIENT: "${message}"

    Réponds de manière utile et professionnelle. Format JSON :
    {
      "response": "ta réponse détaillée",
      "suggestions": ["suggestion 1", "suggestion 2"],
      "actionRequired": false,
      "category": "information|reservation|support|autre"
    }
    `;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let chatbotResponse;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                chatbotResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Format de réponse invalide");
            }
        } catch (error) {
            chatbotResponse = {
                response: "Je suis là pour vous aider avec vos réservations hôtelières. Comment puis-je vous assister aujourd'hui ?",
                suggestions: ["Voir les chambres disponibles", "Mes réservations", "Contacter le support"],
                actionRequired: false,
                category: "information"
            };
        }

        res.json({
            success: true,
            ...chatbotResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Erreur chatbot:", error);
        res.status(500).json({
            msg: "Erreur lors du traitement de votre demande",
            error: error.message
        });
    }
};

// Helper functions
function analyzeUserPreferences(reservations, additionalPreferences = {}) {
    const preferences = {
        preferredTypes: [],
        avgBudget: 0,
        frequentServices: [],
        preferredHotels: []
    };

    if (reservations.length === 0) {
        return preferences;
    }

    // Analyze room types
    const typeCounts = {};
    let totalPrice = 0;
    const serviceCounts = {};
    const hotelCounts = {};

    reservations.forEach(reservation => {
        if (reservation.chambre) {
            const type = reservation.chambre.type;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
            totalPrice += reservation.montantTotal || 0;

            const hotelName = reservation.chambre.hotel?.nom;
            if (hotelName) {
                hotelCounts[hotelName] = (hotelCounts[hotelName] || 0) + 1;
            }
        }

        if (reservation.services) {
            reservation.services.forEach(service => {
                if (service.nom) {
                    serviceCounts[service.nom] = (serviceCounts[service.nom] || 0) + 1;
                }
            });
        }
    });

    // Get most frequent preferences
    preferences.preferredTypes = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);

    preferences.avgBudget = Math.round(totalPrice / reservations.length);

    preferences.frequentServices = Object.entries(serviceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([service]) => service);

    preferences.preferredHotels = Object.entries(hotelCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hotel]) => hotel);

    // Merge with additional preferences
    return { ...preferences, ...additionalPreferences };
}

function generateFallbackRecommendations(availableRooms, userPreferences) {
    return {
        recommendations: availableRooms.slice(0, 3).map((room, index) => ({
            roomId: room._id,
            roomNumber: room.numero,
            hotelName: room.hotel.nom,
            reason: `Chambre ${room.type} spacieuse et bien équipée dans l'hôtel ${room.hotel.nom}`,
            score: 85 - (index * 5),
            highlights: [`Type: ${room.type}`, `Capacité: ${room.capacite} personnes`, `Prix: ${room.prix}€/nuit`]
        }))
    };
}

function generateFallbackDescription(room) {
    const descriptions = {
        'SIMPLE': 'Chambre confortable et fonctionnelle, idéale pour les voyageurs seuls cherchant un hébergement pratique.',
        'DOUBLE': 'Chambre spacieuse parfaite pour les couples, offrant tout le confort nécessaire pour un séjour agréable.',
        'SUITE': 'Suite luxueuse avec espace de vie séparé, parfaite pour un séjour inoubliable.',
        'DELUXE': 'Chambre haut de gamme avec prestations exclusives pour une expérience d\'exception.'
    };

    return {
        description: descriptions[room.type] || 'Chambre confortable et bien équipée.',
        highlights: [`Type ${room.type}`, `Capacité ${room.capacite} personnes`, `Vue ${room.vue || 'agréable'}`],
        targetAudience: 'Voyageurs cherchant confort et qualité'
    };
}

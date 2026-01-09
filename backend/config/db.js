const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const connectDB = async () => {
  try {
    // Connexion MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connecté : ${conn.connection.host}`);

    // Vérification de la clé API Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.7,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096,
          },
        });

        // Test simple de connexion
        const result = await model.generateContent("Test connection");
        console.log('✅ Gemini API Connecté avec succès');
      } catch (geminiError) {
        console.error('❌ Erreur de connexion Gemini API:', geminiError.message);
        console.log('⚠️  Les fonctionnalités IA ne seront pas disponibles');
      }
    } else {
      console.log('⚠️  GEMINI_API_KEY non définie - fonctionnalités IA désactivées');
    }

  } catch (error) {
    console.error(`Erreur : ${error.message}`);
    process.exit(1); // Arrête le processus en cas d'échec [cite: 55]
  }
};

module.exports = connectDB;
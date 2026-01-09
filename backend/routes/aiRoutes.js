const express = require('express');
const router = express.Router();
const {
    getRecommendations,
    generateRoomDescription,
    chatbotAssistance
} = require('../controllers/aiController');

// Get personalized room recommendations
router.post('/recommendations', getRecommendations);

// Generate AI-powered room description
router.get('/room-description/:roomId', generateRoomDescription);

// Chatbot assistance
router.post('/chatbot', chatbotAssistance);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getRecommendations,
    generateRoomDescription,
    chatbotAssistance
} = require('../controllers/aiController');

router.post('/recommendations', getRecommendations);
router.get('/room-description/:roomId', generateRoomDescription);

router.post('/chatbot', chatbotAssistance);

module.exports = router;

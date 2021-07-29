const express = require('express');
const router = express.Router();

// import index controllers
const conversationControllers = require('../controllers/conversation');

router.post('/testing', conversationControllers.testing);

router.post('/getUserChat', conversationControllers.getUserChat);

router.post('/getChatUserId', conversationControllers.getChatUserId);

router.post('/deleteConversation', conversationControllers.deleteConversation);

module.exports = router;

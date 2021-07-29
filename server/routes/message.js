const express = require('express');
const router = express.Router();

// import index controllers
const messageControllers = require('../controllers/message');

router.post('/testing', messageControllers.testing);

router.post('/postNewMessage', messageControllers.postNewMessage);

router.post('/getMessage', messageControllers.getMessage);

module.exports = router;

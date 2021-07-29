const express = require('express');
const router = express.Router();

// import index controllers
const indexControllers = require('../controllers/index');

// INDEX ROUTES
router.post('/register', indexControllers.handleUserRegistration);

router.post('/login', indexControllers.handleUserLogin);

router.post('/updateUserInfo', indexControllers.updateUserInfo);

router.get('/getUser', indexControllers.getUser);

router.get('/getPet', indexControllers.getPet);

router.post('/postGoogleUser', indexControllers.postGoogleUser);

router.post('/updateUserProfileImage', indexControllers.updateUserProfileImage);

router.post('/handleUpload', indexControllers.handleUpload);

module.exports = router;

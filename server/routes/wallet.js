const express = require('express');
const router = express.Router();

// import user controllers
const walletControllers = require('../controllers/wallet');

// PET ROUTES
router.post('/showCoin', walletControllers.showCoinAmount);

router.post('/claimCoin', walletControllers.claimCoin);

router.post('/addCointFromPost', walletControllers.addCointFromPost);

module.exports = router;

const express = require('express');
const router = express.Router();

// import user controllers
const transactionControllers = require('../controllers/transaction');

// USER ROUTES
router.post('/addTransaction', transactionControllers.addTransaction);

router.post(
  '/displayAllTransaction',
  transactionControllers.displayAllTransaction,
);

module.exports = router;

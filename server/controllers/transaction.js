const express = require('express');

// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Wallet = require('../models/wallet');
const Transaction = require('../models/transaction');
// var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  addTransaction: async (req, res) => {
    const {walletId, description, coinAmount} = req.body;
    console.log('print out wallet', walletId);
    const newTransaction = new Transaction({
      description: description,
      coinAmount: coinAmount,
    });
    await newTransaction.save();
    //complete created new transaction collection
    const userWallet = await Wallet.findById(walletId);
    //console.log('coint amount', userWallet.petnerupCoin + coinClaim);
    await userWallet.transaction.push(newTransaction._id);
    await userWallet.save();
    console.log('finish add transaction');
    res.send(newTransaction);
  },

  displayAllTransaction: async (req, res) => {
    const {walletId} = req.body;
    console.log('print out wallet', walletId);
    console.log('inside the get all transaction function');
    //complete created new transaction collection
    const userWallet = await Wallet.findById(walletId).populate('transaction');
    //console.log('coint amount', userWallet.petnerupCoin + coinClaim);
    // const allTransaction = await userWallet.populate('transaction');
    console.log('display all the transaction', userWallet);
    res.json(userWallet.transaction);
    console.log('finish showing all the transaction');
  },
};

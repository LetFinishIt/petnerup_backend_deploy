const express = require('express');

// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Wallet = require('../models/wallet');
const Transaction = require('../models/transaction');

// var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  resetFunction: async () => {
    try {
      const resetTemp = await Wallet.updateMany({$set: {tempCoin: 0}});
      console.log('coin Claim has been reset successfully');
    } catch (err) {
      // res.json({message: err});
      console.log(err);
    }
  },

  showCoinAmount: async (req, res) => {
    console.log('show coin function');
    const {userId} = req.body;
    //Wallet.populate('user');
    const result = await User.findById(userId).populate('wallet');
    console.log('print out ', result.wallet);
    res.send(result.wallet);
  },

  addCointFromPost: async (req, res) => {
    const {
      coinSentAmount,
      authorId,
      profileType,
      walletId,
      senderProfilePicture,
      userName,
    } = req.body;
    const currentUserWallet = await Wallet.findById(walletId);
    if (parseInt(coinSentAmount.coinSentInput, 10) <= 0) {
      console.log('function works');
      return res.json({message: 'please input the correct amount'});
    } else if (currentUserWallet.petnerupCoin <= 0 || 
      currentUserWallet.petnerupCoin <
      parseInt(coinSentAmount.coinSentInput, 10)) {
      return res.json({message: 'please reload your coin'});
    } else {
      console.log('wallet id ', walletId);
      console.log('amount coin', coinSentAmount);

      // search post user
      const postUserOwner = await User.findById(authorId);
      // search pet owner
      const postPetOwner = await Pet.findById(authorId);
      // add coin to post owner
      if (profileType === 'user') {
        // const postUserOwner = await User.findById(authorId);
        const postOwnerWallet = await Wallet.findById(postUserOwner.wallet);
        postOwnerWallet.petnerupCoin =
          postOwnerWallet.petnerupCoin +
          parseInt(coinSentAmount.coinSentInput, 10);
        // await postOwnerWallet.transaction.push(newTransaction._id);
        // add transaction to reciever as a user
        const newTransactionReciever = new Transaction({
          description: `recieved coin from ${userName} `,
          coinAmount: coinSentAmount.coinSentInput,
          transactionAvatar: senderProfilePicture,
          type: 'recieved',
          transactionTitle: 'RECIEVED COINS',
        });
        await newTransactionReciever.save();
        await postOwnerWallet.transaction.push(newTransactionReciever._id);
        await postOwnerWallet.save();
        console.log('finish add transaction to reciever user');
      } else {
        // const postPetOwner = await Pet.findById(authorId);
        // console.log('print out owner pet', postPetOwner.owner);
        const postUserOwner = await User.findById(postPetOwner.owner);
        const postOwnerWallet = await Wallet.findById(postUserOwner.wallet);
        postOwnerWallet.petnerupCoin =
          postOwnerWallet.petnerupCoin +
          parseInt(coinSentAmount.coinSentInput, 10);
        // await postOwnerWallet.transaction.push(newTransaction._id);
        const newTransactionReciever = new Transaction({
          description: `recieved coin from ${userName} `,
          coinAmount: coinSentAmount.coinSentInput,
          transactionAvatar: senderProfilePicture,
          type: 'recieved',
          transactionTitle: 'RECIEVED COINS',
        });
        await newTransactionReciever.save();
        await postOwnerWallet.transaction.push(newTransactionReciever._id);
        await postOwnerWallet.save();
        console.log('finish add transaction to reciever pet');
      }

      //create the transaction for sender
      if (profileType === 'user') {
        // if receiver is a user
        const newTransactionSender = new Transaction({
          description: `sending coin to ${postUserOwner.username} `,
          coinAmount: coinSentAmount.coinSentInput,
          transactionAvatar: postUserOwner.profilePicture,
          type: 'send',
          transactionTitle: 'SEND COINS',
        });
        await newTransactionSender.save();
        await currentUserWallet.transaction.push(newTransactionSender._id);
        await currentUserWallet.save();
      } else {
        // if receiver is a pet
        const newTransactionSender = new Transaction({
          description: `sending coin to ${postPetOwner.username} `,
          coinAmount: coinSentAmount.coinSentInput,
          transactionAvatar: postPetOwner.profilePicture,
          type: 'send',
          transactionTitle: 'SEND COINS',
        });
        await newTransactionSender.save();
        await currentUserWallet.transaction.push(newTransactionSender._id);
        await currentUserWallet.save();
      }

      // remove coin from existed user
      currentUserWallet.petnerupCoin =
        currentUserWallet.petnerupCoin - coinSentAmount.coinSentInput;
      // await currentUserWallet.save();
      await currentUserWallet.save();
      console.log('finish add transaction to sender');
      //send back all transaction description and thank message,
      res.send({
        message: 'thank for sending coin',
      });
    }

    console.log('finish sending coin and remove coin');
  },

  claimCoin: async (req, res) => {
    const coinClaim = 5;
    // claim coin
    const {walletId} = req.body;
    console.log('print out wallet', walletId);
    const userWallet = await Wallet.findById(walletId);
    let todayClaim = userWallet.tempCoin;
    //console.log('coint amount', userWallet.petnerupCoin + coinClaim);
    if (todayClaim >= coinClaim) {
      res.send('Already Claim Your Coin Today');
    } else {
      userWallet.petnerupCoin = userWallet.petnerupCoin + coinClaim;
      userWallet.tempCoin = userWallet.tempCoin + coinClaim;
      //create claim coin transaction
      const newTransaction = new Transaction({
        description: 'Sucessfully Claim Your Coin',
        coinAmount: coinClaim,
        transactionAvatar:
          'https://res.cloudinary.com/vinhtruong45/image/upload/v1626914019/ujnhunrhfrdrapeuvegc.png',
        type: 'login',
        transactionTitle: 'REWARDS COINS',
      });
      await newTransaction.save();
      await userWallet.transaction.push(newTransaction._id);
      await userWallet.save();
      res.send('Sucessfully Claim Your Coin');
      //complete created new transaction collection
      //console.log('coint amount', userWallet.petnerupCoin + coinClaim);
    }
    console.log('finish add coin');
  },
};

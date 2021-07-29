const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name

const WalletSchema = new Schema(
  {
    petnerupCoin: {
      type: Number,
    },
    tempCoin: {
      type: Number,
    },
    transaction: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    updateDate: {
      type: Date,
    },
  },
  {
    collection: 'wallet',
  },
);

const Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = Wallet;

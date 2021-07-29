const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name

const TransactionSchema = new Schema(
  {
    transactionTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    coinAmount: {
      type: Number,
    },
    transactionAvatar: {
      type: String,
    },
    type: {
      type: String,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    updateDate: {
      type: Date,
    },
  },
  {
    collection: 'transaction',
  },
);

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;

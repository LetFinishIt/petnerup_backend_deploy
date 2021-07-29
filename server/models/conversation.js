const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name

const ConversationSchema = new Schema(
  {
    members: {
      type: Array,
    },
    receieverType: {
      type: String,
    },
    senderType: {
      type: String,
    },
  },
  {timestamps: true},
);

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;

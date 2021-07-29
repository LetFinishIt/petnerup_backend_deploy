const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name

const CommentSchema = new Schema(
  {
    author: {
      userAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      petAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
      },
    },
    comment: {
      type: String,
      require: true,
      trim: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'comments',
  },
);

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;

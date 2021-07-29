const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name

const PostSchema = new Schema(
  {
    mediaFile: [
      {
        type: String,
      },
    ],
    description: String,
    location: String,
    // geometry: {
    //   type: {
    //     type: String,
    //     enum: ['Point'],
    //     require: true,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     require: true,
    //   },
    // },
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
    likes: {
      userLikes: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
      },
      petLikes: {
        type: [Schema.Types.ObjectId],
        ref: 'Pet',
      },
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
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
    collection: 'posts',
  },
);

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;

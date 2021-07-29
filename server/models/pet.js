const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name

const PetSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      default: 'pet',
    },
    petType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    sex: {
      type: String,
      required: true,
      trim: true,
    },
    biography: {
      type: String,
      trim: true,
    },
    likes: {
      type: String,
      trim: true,
    },
    dislikes: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    birthday: {
      type: Date,
      trim: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    followers: {
      userFollowers: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
      },
      petFollowers: {
        type: [Schema.Types.ObjectId],
        ref: 'Pet',
      },
    },
    following: {
      userFollowing: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
      },
      petFollowing: {
        type: [Schema.Types.ObjectId],
        ref: 'Pet',
      },
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
    collection: 'pets',
  },
);

const Pet = mongoose.model('Pet', PetSchema);
module.exports = Pet;

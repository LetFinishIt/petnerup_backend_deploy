const mongoose = require('mongoose');
const Schema = mongoose.Schema; // change variable name
const bcrypt = require('bcrypt');

const UserSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      default: 'user',
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    birthday: {
      type: String,
      trim: true,
    },
    biography: {
      type: String,
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
    family: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
      },
    ],
    wallet: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
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
    collection: 'users',
  },
);

UserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      if (!isMatch) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;

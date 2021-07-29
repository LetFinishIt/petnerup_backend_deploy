const express = require('express');
const jwt = require('jsonwebtoken');
const jwtkey = process.env.JWT_KEY;

// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Chat = require('../models/conversation');
const Wallet = require('../models/wallet');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(
  '409964668192-mbhqp3eb3t4bvvfo1cmur603jru5hl74.apps.googleusercontent.com',
);
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const moment = require('moment');

function escapeRegex(string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

//
const storage = multer.diskStorage({
  destination: 'api',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + moment().unix() + '.mov');
  },
});
const upload = multer({storage: storage});

//
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   },
// });

// INDEX CONTROLLERS
module.exports = {
  handleUserRegistration: async (req, res) => {
    let {email, password} = req.body;
    email = email.toLowerCase();
    // const domain = email.match(/(?<=.+@)[^@]+$/)[0];syepesca@example.com 123456
    const name = email.match(/^.+(?=@)/)[0]; // there is a problem when emails has the same name with different domains
    const saltName = `${name}_${Math.floor(Math.random() * 9)}${Math.floor(
      Math.random() * 9,
    )}`;
    const username = saltName;
    //   console.log(username);

    try {
      const newUser = new User({
        email,
        password,
        username,
      });
      await newUser.save();
      const token = jwt.sign({userId: newUser._id}, jwtkey);
      const userBeforeAddWallet = await User.findOne({email});
      const newWallet = new Wallet({
        petnerupCoin: 0,
        tempCoin: 0,
      });
      await newWallet.save();
      console.log(newWallet);
      // push wallet id to the user.wallet
      let user = await User.findById(userBeforeAddWallet._id);
      // console.log('print out', walletToUserAccount);
      await user.wallet.push(newWallet._id);
      await user.save();
      console.log(' new wallet added along with user', user);
      // console.log('print out user', user);
      res.send({token, user});
    } catch (err) {
      return res.status(422).send({error: err.message});
    }
  },

  handleUserLogin: async (req, res) => {
    let {email, password} = req.body;
    //console.log(typeof email);
    email = email.toLowerCase();
    if (!email || !password) {
      console.log('must provide email and password');
      return res.status(422).send({error: 'must provide email and password'});
    }
    const user = await User.findOne({email})
      .populate('posts')
      .populate({
        path: 'pets',
        options: {sort: {petName: 'asc'}},
      })
      .populate({
        path: 'family',
        options: {sort: {firstName: 'asc'}},
        populate: {
          path: 'pets',
          options: {sort: {petName: 'asc'}},
          populate: {
            path: 'owner',
            select: ['username', 'firstName'],
          },
        },
      })
      .populate({
        path: 'following',
        populate: [
          {
            path: 'userFollowing',
            model: 'User',
            select: ['username', 'profilePicture', 'type'],
          },
          {
            path: 'petFollowing',
            model: 'Pet',
            select: ['username', 'profilePicture', 'type'],
          },
        ],
      })
      .populate({
        path: 'followers',
        populate: [
          {
            path: 'userFollowers',
            model: 'User',
            select: ['username', 'profilePicture', 'type'],
          },
          {
            path: 'petFollowers',
            model: 'Pet',
            select: ['username', 'profilePicture', 'type'],
          },
        ],
      });
    if (!user) {
      console.log('user can not be found problem');
      //   console.log(email);
      return res.status(422).send({error: 'email not found'});
    }
    try {
      await user.comparePassword(password);
      const token = jwt.sign({userId: user._id}, jwtkey);
      res.send({token, user});
    } catch (err) {
      console.log('password not match');
      return res.status(422).send({error: 'password not match'});
    }
  },

  updateUserInfo: async (req, res) => {
    User.findByIdAndUpdate(req.body.id, {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      biography: req.body.biography,
      birthday: req.body.birthday,
      updateDate: req.body.updateDate,
    })
      .then(data => {
        res.send(data);
        // console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  },

  updateUserProfileImage: async (req, res) => {
    //const user = {};
    //const token = jwt.sign({userId: user._id}, jwtkey);
    User.findByIdAndUpdate(req.body.id, {
      profilePicture: req.body.profilePicture,
    })
      .then(data => {
        res.send({user: data});
        console.log('response send back');
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  },

  getUser: async (req, res) => {
    const searchField = req.query.username;
    // Get all campgrounds from DB
    User.find({username: {$regex: searchField, $options: '$i'}})
      .then(data => {
        res.send(data);
        //console.log(data);
        console.log(typeof data);
      })
      .catch(err => {
        console.log(err);
      });
  },

  getPet: async (req, res) => {
    const searchField = req.query.username;
    // Get all campgrounds from DB
    Pet.find({username: {$regex: searchField, $options: '$i'}})
      .then(data => {
        res.send(data);
        //console.log(data);
        console.log(typeof data);
      })
      .catch(err => {
        console.log(err);
      });
  },

  // upload = multer({
  //   storage: storage,
  //   limits: { fileSize: 1024 * 1024 },
  //   fileFilter: fileFilter
  // })
  handleUpload: async (req, res) => {
    // let {uploadObject} = req.body;
    console.log('get inside the post request');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
    console.log('pass the config of cloudinary');
    upload.single('videoUpload');
    console.log('pass the upload function for single');
    const file = req.files;
    cloudinary.uploader.upload_large(
      file.videoUpload.tempFilePath,
      {
        resource_type: 'auto',
      },
      function (error, result) {
        res.send(result);
        console.log('problem after the upload file name');
        console.log(error, 'This is the error');
        console.log(result, 'This is the result');
      },
    );
    // cloudinary.uploader.upload(
    //   req.body,
    //   {resource_type: 'video'},
    //   function (error, result) {
    //     res.send(result);
    //     console.log(result, error);
    //   },
    // );
  },

  postGoogleUser: async (req, res) => {
    const {tokenId} = req.body;

    //define audience and tokenId
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience:
        '409964668192-mbhqp3eb3t4bvvfo1cmur603jru5hl74.apps.googleusercontent.com',
    });

    // assgined new payload to our new object
    const payload = ticket.getPayload();
    const username = payload.email;
    const email = payload.email;
    const password = 123456;
    const firstName = payload.given_name;
    const lastName = payload.family_name;

    if (payload.email_verified) {
      console.log('verified email is true');
      User.findOne({email}).exec((err, user) => {
        if (err) {
          return res.status(400).json({
            error: 'something wrong with  user signin',
          });
        } else {
          if (user) {
            const token = jwt.sign({userId: user._id}, jwtkey);
            res.send({token, user});
          } else {
            const newUser = new User({
              email,
              username,
              password,
              firstName,
              lastName,
            });
            newUser.save((err, data) => {
              if (err) {
                return res.status(400).json({
                  error: 'something wrong with  user signin',
                });
              }
              const token = jwt.sign({userId: data._id}, jwtkey);
              //const {data} = newUser;
              console.log('register new google account success');
              res.send({
                token,
                user: data,
              });
            });
          }
        }
      });
    }
  }, // end of post google user function
};

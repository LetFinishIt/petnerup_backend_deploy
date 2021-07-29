const express = require('express');
const mongoose = require('mongoose');
const loremIpsum = require('lorem-ipsum').loremIpsum;

// IMPORT VARIABLES
// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Wallet = require('../models/wallet');
// const Message = require('../models/message');

// import cities
const cities = require('./cities');
// import seed helpers
const {names, lastNames, petNames, dogBreeds, sex} = require('./seedHelpers');

// RANDOM HELPERS
// receive and array and select a random item from the array
const selectRandomFromArray = array =>
  array[Math.floor(Math.random() * array.length)];
// create random date
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

module.exports.seedDB = async () => {
  // Delete all data from DB
  await User.deleteMany({}).then(console.log('All Users DELETED'));
  await Pet.deleteMany({}).then(console.log('All Pets DELETED'));
  await Post.deleteMany({}).then(console.log('All Posts DELETED'));
  await Comment.deleteMany({}).then(console.log('All Comments DELETED'));
  // await Chat.deleteMany({}).then(console.log('All Chat DELETED'));

  // Create Users
  for (let i = 0; i < 100; i++) {
    const newUser = new User({
      email: `user${i + 1}@example.com`,
      username: `user${i + 1}`,
      password: '123456',
      profilePicture: `https://picsum.photos/id/${Math.floor(
        Math.random() * 800 + 1,
      )}/200/300`,
      firstName: `${selectRandomFromArray(names)}`,
      lastName: `${selectRandomFromArray(lastNames)}`,
      biography: `${loremIpsum()}`,
      family: [],
      pets: [],
      posts: [],
      followers: {},
      following: {},
      wallet: [],
      dateCreated: randomDate(new Date(2018, 0, 1), new Date()),
    });
    await newUser.save().then(console.log(`User${i + 1} - saved.`));
  }
  // Create Pets
  for (let i = 0; i < 200; i++) {
    const newPet = new Pet({
      username: `pet${i + 1}`,
      petType: 'Dog',
      status: 'Alive',
      profilePicture: `https://picsum.photos/id/${Math.floor(
        Math.random() * 800 + 1,
      )}/200/300`,
      petName: `${selectRandomFromArray(petNames).toLowerCase()}`,
      breed: `${selectRandomFromArray(dogBreeds)}`,
      sex: `${selectRandomFromArray(sex)}`,
      birthday: '',
      biography: `${loremIpsum()}`,
      likes: '',
      dislikes: '',
      owner: null,
      posts: [],
      followers: {},
      following: {},
      dateCreated: randomDate(new Date(2018, 0, 1), new Date()),
    });
    await newPet.save().then(console.log(`Pet${i + 1} - saved.`));
  }
  // Create Posts
  for (let i = 0; i < 500; i++) {
    let {city, state} = selectRandomFromArray(cities);
    const newPost = new Post({
      mediaFile: `https://picsum.photos/id/${Math.floor(
        Math.random() * 500 + 1,
      )}/200/300`,
      description: `${loremIpsum()} ${loremIpsum()}`,
      location: `${city}, ${state}`,
      author: {},
      likes: {},
      comments: [],
      dateCreated: randomDate(new Date(2018, 0, 1), new Date()),
    });
    await newPost.save().then(console.log(`Post${i + 1} - saved.`));
  }
  // Create Comments
  for (let i = 0; i < 600; i++) {
    const newComment = new Comment({
      author: {},
      comment: `${loremIpsum()} ${loremIpsum()} ${loremIpsum()}`,
      dateCreated: randomDate(new Date(2018, 0, 1), new Date()),
    });
    await newComment.save().then(console.log(`Comment${i + 1} - saved.`));
  }

  //Create Wallet
  for (let i = 0; i < 5; i++) {
    const newWallet = new Wallet({
      petnerupCoin: `${Math.floor(Math.random() * 16)}`,
      dateCreated: randomDate(new Date(2018, 0, 1), new Date()),
    });
    await newWallet.save().then(console.log(`Wallet${i + 1} - saved.`));
  }

  //Create Message
  // for (let i = 0; i < 2; i++) {
  //   const newMessage = new Message({
  //     member: [],
  //   });
  //   await newMessage.save().then(console.log(`Message${i + 1} - saved.`));
  // }
};

module.exports.bindInfo = async () => {
  // query all ids from database and store them into an array
  const userIds = await User.find().distinct('_id');
  const petIds = await Pet.find().distinct('_id');
  const postIds = await Post.find().distinct('_id');
  const commentIds = await Comment.find().distinct('_id');
  const walletIds = await Wallet.find().distinct('_id');

  // Bind user information
  userIds.forEach(async userId => {
    const user = await User.findById(userId);
    // random post
    for (let i = 0; i < Math.floor(Math.random() * 100); i++) {
      user.posts.push(selectRandomFromArray(postIds));
    }
    // random followers
    for (let i = 0; i < Math.floor(Math.random() * 200); i++) {
      user.followers.userFollowers.push(selectRandomFromArray(userIds));
      user.followers.petFollowers.push(selectRandomFromArray(petIds));
    }
    // random following
    for (let i = 0; i < Math.floor(Math.random() * 100); i++) {
      user.following.userFollowing.push(selectRandomFromArray(userIds));
      user.following.petFollowing.push(selectRandomFromArray(petIds));
    }
    // random family members
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
      user.family.push(selectRandomFromArray(userIds));
    }
    // random pets
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
      user.pets.push(selectRandomFromArray(petIds));
    }
    await user.save();
  });
  // Bind pet information
  petIds.forEach(async petId => {
    const pet = await Pet.findById(petId);
    // random post
    for (let i = 0; i < Math.floor(Math.random() * 100); i++) {
      pet.posts.push(selectRandomFromArray(postIds));
    }
    // random followers
    for (let i = 0; i < Math.floor(Math.random() * 200); i++) {
      pet.followers.userFollowers.push(selectRandomFromArray(userIds));
      pet.followers.petFollowers.push(selectRandomFromArray(petIds));
    }
    // random following
    for (let i = 0; i < Math.floor(Math.random() * 100); i++) {
      pet.following.userFollowing.push(selectRandomFromArray(userIds));
      pet.following.petFollowing.push(selectRandomFromArray(petIds));
    }
    // random owner
    pet.owner = selectRandomFromArray(userIds);

    await pet.save();
  });
  // Bind post information
  postIds.forEach(async postId => {
    const post = await Post.findById(postId);
    // bind author
    Math.floor(Math.random() * 2) === 0
      ? (post.author.userAuthor = `${selectRandomFromArray(userIds)}`)
      : (post.author.petAuthor = `${selectRandomFromArray(petIds)}`);
    // random likes
    for (let i = 0; i < Math.floor(Math.random() * 100); i++) {
      post.likes.userLikes.push(selectRandomFromArray(userIds));
      post.likes.petLikes.push(selectRandomFromArray(petIds));
    }
    // random comments
    for (let i = 0; i < Math.floor(Math.random() * 80); i++) {
      post.comments.push(selectRandomFromArray(commentIds));
    }
    await post.save();
  });
  // Bind comment information
  commentIds.forEach(async commentId => {
    const comment = await Comment.findById(commentId);
    // bind author
    Math.floor(Math.random() * 2) === 0
      ? (comment.author.userAuthor = `${selectRandomFromArray(userIds)}`)
      : (comment.author.petAuthor = `${selectRandomFromArray(petIds)}`);
    await comment.save();
  });

  // walletIds.forEach(async walletId => {
  //   const wallet = await Wallet.findById(walletId);
  //   // bind user
  //   wallet.User = `${selectRandomFromArray(userIds)}`;
  //   await wallet.save();
  // });
  // chatIds.forEach(async chatId => {
  //   const chat = await Chat.findById(chatId);
  //   // bind author
  //   Math.floor(Math.random() * 2) === 0
  //     ? (chat.recieverId.userAuthor = `${selectRandomFromArray(userIds)}`)
  //     : (chat.recieverId.petAuthor = `${selectRandomFromArray(petIds)}`);
  //   await chat.save();
  // });
  // chatIds.forEach(async chatId => {
  //   const chat = await Chat.findById(chatId);
  //   // bind author
  //   Math.floor(Math.random() * 2) === 0;
  //   chat.senderId = `${selectRandomFromArray(userIds)}`;
  //   await chat.save();
  // });
  //Bind chat information
  // chatIds.forEach(async chatId => {
  //   const chat = await Chat.findById(chatId);
  //   // bind author
  //   Math.floor(Math.random() * 2) === 0
  //     ? (comment.author.userAuthor = `${selectRandomFromArray(userIds)}`)
  //     : (comment.author.petAuthor = `${selectRandomFromArray(petIds)}`);
  //   await comment.save();
  // });
};

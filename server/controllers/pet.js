const express = require('express');

// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Comment = require('../models/comment');

// Reusable methods
const getPostsInfo = async function (postsArrayIds) {
  let postsInfo = await Post.find({_id: {$in: postsArrayIds}})
    .populate({
      path: 'likes',
      populate: [
        {
          path: 'userLikes',
          model: 'User',
          select: ['username', 'profilePicture', 'type'],
        },
        {
          path: 'petLikes',
          model: 'Pet',
          select: ['username', 'profilePicture', 'type'],
        },
      ],
    })
    .populate({
      path: 'author',
      populate: [
        {
          path: 'userAuthor',
          model: 'User',
          select: ['username', 'profilePicture', 'type'],
        },
        {
          path: 'petAuthor',
          model: 'Pet',
          select: ['username', 'profilePicture', 'type'],
        },
      ],
    })
    .populate({
      path: 'comments',
      options: {sort: {dateCreated: 'desc'}},
      populate: {
        path: 'author',
        populate: [
          {
            path: 'userAuthor',
            model: 'User',
            select: ['username', 'profilePicture', 'type'],
          },
          {
            path: 'petAuthor',
            model: 'Pet',
            select: ['username', 'profilePicture', 'type'],
          },
        ],
      },
    })
    .sort({dateCreated: 'desc'});
  return postsInfo;
};

// INDEX CONTROLLERS
module.exports = {
  getPetById: async (req, res) => {
    // 1) grab info from request
    const {petId} = req.body;
    // console.log('Pet Id :>> ', petId);
    // 2) find user by id
    const pet = await Pet.findById(petId)
      .populate({
        path: 'owner',
        populate: {
          path: 'family',
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
    const petPostsPopulated = await getPostsInfo(pet.posts);
    pet.posts = await [...petPostsPopulated];
    // console.log('Pet Info :>> ', pet);
    // 3) send info
    res.json(pet);
  },

  addNewPet: async (req, res) => {
    // to add a new pet: first, add pet into active user profile and into family profiles too.
    // 1) grab request info
    let {
      profilePicture,
      owner,
      status,
      username,
      petName,
      petType,
      sex,
      breed,
      biography,
      likes,
      dislikes,
      birthday,
      updateDate,
    } = req.body;
    // 2) add pet into active user profile
    const newPet = new Pet({
      type: 'pet',
      profilePicture: profilePicture,
      owner: owner,
      status: status,
      username: username,
      petName: petName,
      petType: petType,
      sex: sex,
      breed: breed,
      biography: biography,
      likes: likes,
      dislikes: dislikes,
      birthday: birthday,
      updateDate: updateDate,
    });
    newPet.followers.userFollowers.push(owner);
    await newPet.save();
    const activeUser = await User.findById(owner).populate('family');
    await activeUser.pets.push(newPet._id);
    await activeUser.following.petFollowing.push(newPet._id);
    // 3) add pet into family profiles
    activeUser.family.forEach(async familyMember => {
      let familyMemberToAddPet = await User.findById(familyMember._id);
      familyMemberToAddPet.pets.push(newPet._id);
      await familyMemberToAddPet.save();
    });

    await activeUser.save();
    // 4) send updated information
    res.send(newPet);
  },

  addPetToFamily: async (req, res) => {
    // to add a existing pet to family: push pet id to active user pets array
    // 1) grab request info
    let {activeUserId, petToAddId} = req.body;
    // 2) add pet into active user pets array
    const activeUser = await User.findById(activeUserId);
    await activeUser.pets.push(petToAddId);
    await activeUser.save();
    // 3) send updated information
    res.send('Family Pet ADDED to Active profile');
  },

  updatePetInfo: async (req, res) => {
    Pet.findByIdAndUpdate(req.body.petId, {
      type: 'pet',
      owner: req.body.owner,
      profilePicture: req.body.profilePicture,
      status: req.body.status,
      username: req.body.username,
      petName: req.body.petName,
      petType: req.body.petType,
      sex: req.body.sex,
      breed: req.body.breed,
      biography: req.body.biography,
      likes: req.body.likes,
      dislikes: req.body.dislikes,
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

  updatePetProfileImage: async (req, res) => {
    //const user = {};
    //const token = jwt.sign({userId: user._id}, jwtkey);
    Pet.findByIdAndUpdate(req.body.id, {
      profilePicture: req.body.profilePicture,
    })
      .then(data => {
        res.send(data);
        console.log('response send back');
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  },

  deletePetProfile: async (req, res) => {
    // 1) grab info from request
    const {activeUserId, petToRemoveId} = req.body;
    const activeUser = await User.findById(activeUserId).populate('family');
    const petToRemove = await Pet.findById(petToRemoveId);
    // 2) delete pet
    // 2.1) if the user that is deleting the pet is the owner, then the pet should be remove from: 1.Pet Collection 2.His pets array 3.His family members
    if (String(petToRemove.owner) === activeUserId) {
      console.log(true);
      // 2.1.1) Remove from Active user pets array
      activeUser.pets.remove(petToRemoveId);
      await activeUser.save();
      // 2.1.2) Remove from Active user family members
      activeUser.family.forEach(async familyMember => {
        let familyMemberToRemovePet = await User.findById(familyMember._id);
        familyMemberToRemovePet.pets.remove(petToRemoveId);
        await familyMemberToRemovePet.save();
      });
      // 2.1.3) Remove from Pet Collection
      await Pet.findByIdAndRemove(petToRemoveId);
    }
    // 2.2) if the user that is deleting the pet is NOT the owner, then the pet should only be remove from his pets array
    else {
      console.log(false);
      activeUser.pets.remove(petToRemoveId);
      await activeUser.save();
    }

    // 3) send updated info
    res.send('Pet DELETED');
  },
};

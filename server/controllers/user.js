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

const uniqueIdsFromObjectArray = array => {
  const uniqueArray = array.filter(
    (item, index) => array.findIndex(obj => obj._id === item._id) === index,
  );
  return uniqueArray;
};

const uniqueIdsFromArray = array => {
  const uniqueArray = array.filter(
    (item, index) => array.findIndex(obj => obj === item) === index,
  );
  return uniqueArray;
};

// INDEX CONTROLLERS
module.exports = {
  getUserById: async (req, res) => {
    // 1) grab info from request
    const {userId} = req.body;
    // console.log('User Id :>> ', userId);
    // 2) find user by id
    const user = await User.findById(userId)
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
    const userPostsPopulated = await getPostsInfo(user.posts);
    user.posts = await [...userPostsPopulated];
    // console.log('User Info :>> ', user);
    // 3) send info
    res.json(user);
  },

  getOwnPosts: async (req, res) => {
    // 1) query all own posts
    let {ownPostsIds} = req.body;
    console.log('Own Posts :>> ', ownPostsIds);
    const ownPostsInfo = await getPostsInfo(ownPostsIds);
    console.log('Own Posts Info :>> ', ownPostsInfo);
    return res.json(ownPostsInfo);
  },

  getOwnPetPosts: async (req, res) => {
    // 1) search all own pets by ids
    let ownPetsPostsIds = [];
    let {ownPetsIds} = req.body;
    console.log('Own Pet Ids :>> ', ownPetsIds);
    const ownPetsInfo = await Pet.find({_id: {$in: ownPetsIds}}, [
      'posts',
      'username',
    ]);
    console.log('Own Pet Posts :>> ', ownPetsInfo);
    // 2) grab posts ids from each pet, then create array of pet ids
    ownPetsInfo.forEach(pet => {
      ownPetsPostsIds.push(pet.posts);
    });
    let merged_OwnPetsPostsIds = [].concat.apply([], ownPetsPostsIds); // merging array of arrays from above query
    console.log('Own Pet Posts Ids :>> ', merged_OwnPetsPostsIds);
    // 3) query all own pet posts
    const ownPetPostsInfo = await getPostsInfo(merged_OwnPetsPostsIds);
    console.log(
      'Own Pet Posts Info :>> ',
      ownPetPostsInfo,
      ownPetPostsInfo.length,
    );
    return res.json(ownPetPostsInfo);
  },

  getFollowingPosts: async (req, res) => {
    // 1) search all following users and pets by ids
    let followingPostsIds = [];
    let {userFollowingIds, petFollowingIds} = req.body;
    console.log('User Following Ids :>> ', userFollowingIds);
    console.log('Pet Following Ids :>> ', petFollowingIds);
    // 1.1) search following user by id
    const userFollowingInfo = await User.find({_id: {$in: userFollowingIds}}, [
      'posts',
      'username',
    ]);
    console.log('Following User Posts :>> ', userFollowingInfo);
    console.log(
      'Following User Posts :>> ',
      userFollowingInfo,
      userFollowingInfo.length,
    );
    // 1.2) search following pets by id
    const petFollowingInfo = await Pet.find({_id: {$in: petFollowingIds}}, [
      'posts',
      'username',
    ]);
    console.log(
      'Following Pet Posts :>> ',
      petFollowingInfo,
      petFollowingInfo.length,
    );
    // 2) grab posts ids from each user and pet, then create array of user and pet ids
    // 2.1) grab all following users posts id
    userFollowingInfo.forEach(user => {
      followingPostsIds.push(user.posts);
    });
    // 2.2) grab all following pets posts id
    petFollowingInfo.forEach(pet => {
      followingPostsIds.push(pet.posts);
    });
    console.log(
      'Following Posts :>> ',
      followingPostsIds,
      followingPostsIds.length,
    );
    // 2.3) merge all posts ids into one array
    let merged_followingPostsIds = [].concat.apply([], followingPostsIds); // merging array of arrays from above query
    console.log(
      'Following Posts Ids :>> ',
      merged_followingPostsIds,
      merged_followingPostsIds.length,
    );
    // 3) query all following posts
    const followingPostsInfo = await getPostsInfo(merged_followingPostsIds);
    console.log(
      'Following Posts Info :>> ',
      followingPostsInfo,
      followingPostsInfo.length,
    );
    return res.json(followingPostsInfo);
  },

  getHomePosts: async (req, res) => {
    // Home posts = own posts + own pets posts + following posts
    let homePostsIds = [];
    let homePostsInfo = [];
    let ownPostsIds = [];
    let ownPetsPostsIds = [];
    let followingPostsIds = [];
    // 1) grab request info
    const {ownPosts, ownPetsIds, userFollowingIds, petFollowingIds} = req.body;
    ownPosts.forEach(post => {
      ownPostsIds.push(post._id);
    });
    // 2) get own posts ids
    // console.log('Own Posts Ids :>> ', ownPostsIds);
    // // 3) get own pets posts ids
    // // console.log('Own Pet Ids :>> ', ownPetsIds);
    // // 3.1) find each pet info to grab their posts ids
    // const ownPetsInfo = await Pet.find({_id: {$in: ownPetsIds}}, [
    //   'posts',
    //   'username',
    // ]);
    // // 3.2) grab posts ids from each pet, then create array of pet ids
    // ownPetsInfo.forEach(pet => {
    //   ownPetsPostsIds.push(pet.posts);
    // });
    // let merged_OwnPetsPostsIds = [].concat.apply([], ownPetsPostsIds); // merging array of arrays from above query
    // // console.log('Own Pet Posts Ids :>> ', merged_OwnPetsPostsIds);
    // 4) get following users and pets posts ids
    // console.log('User Following Ids :>> ', userFollowingIds);
    // console.log('Pet Following Ids :>> ', petFollowingIds);
    // 4.1) search following users by id
    const userFollowingInfo = await User.find({_id: {$in: userFollowingIds}}, [
      'posts',
      'username',
    ]);
    // 4.2) search following pets by id
    const petFollowingInfo = await Pet.find({_id: {$in: petFollowingIds}}, [
      'posts',
      'username',
    ]);
    // 4.3) grab posts ids from each user and pet, then create array of user and pet ids
    // 4.4) grab all following users posts id
    userFollowingInfo.forEach(user => {
      followingPostsIds.push(user.posts);
    });
    // 4.5) grab all following pets posts id
    petFollowingInfo.forEach(pet => {
      followingPostsIds.push(pet.posts);
    });
    // 4.6) merge all posts ids into one array
    let merged_followingPostsIds = [].concat.apply([], followingPostsIds); // merging array of arrays from above query
    // 5) query all own, own pets and following posts ids
    // 5.1) merge all posts ids into one array
    homePostsIds = [
      ...ownPostsIds,
      //   ...merged_OwnPetsPostsIds,
      ...merged_followingPostsIds,
    ];
    // 5.2) fetch all posts info
    homePostsInfo = await getPostsInfo(homePostsIds);
    console.log('Active user total Home Posts :>> ', homePostsInfo.length);
    // 6) send data
    return res.json(homePostsInfo);
  },

  addFollowing: async (req, res) => {
    // To add a following: first, add new following to active user and his pets. Then, add active user and his pets as new followers to the user that is followed.
    // 1) grab request info
    const {activeUserId, profileToFollowId, profileToFollowType} = req.body;
    console.log('Active user Id :>> ', activeUserId);
    console.log('Following Id :>> ', profileToFollowType, profileToFollowId);
    // 2) add new following to active user and his pets
    // 2.1) add new following to active user
    const activeUser = await User.findById(activeUserId);
    profileToFollowType === 'user'
      ? activeUser.following.userFollowing.push(profileToFollowId)
      : activeUser.following.petFollowing.push(profileToFollowId);
    // 2.2) add new following to active user pets
    await activeUser.pets.forEach(async pet => {
      let petToUpdate = await Pet.findById(pet._id);
      profileToFollowType === 'user'
        ? petToUpdate.following.userFollowing.push(profileToFollowId)
        : petToUpdate.following.petFollowing.push(profileToFollowId);
      await petToUpdate.save();
    });
    await activeUser.save();
    // 3) add new followers to the profile that the active user wants to follow
    if (profileToFollowType === 'user') {
      const profileToFollow = await User.findById(profileToFollowId);
      profileToFollow.followers.userFollowers.push(activeUserId);
      profileToFollow.followers.petFollowers.push(...activeUser.pets);
      await profileToFollow.save();
    } else {
      const profileToFollow = await Pet.findById(profileToFollowId);
      profileToFollow.followers.userFollowers.push(activeUserId);
      profileToFollow.followers.petFollowers.push(...activeUser.pets);
      await profileToFollow.save();
    }
    // 4) send updated information
    // res.json(activeUser);
    res.json('DONE FOLLOW');
  },

  removeFollowing: async (req, res) => {
    // To remove a following: first, remove following from active user and his pets. Then, remove following from followers of the user that 'was' followed.
    // 1) grab request info
    const {activeUserId, profileToRemoveId, profileToRemoveType} = req.body;
    console.log('Active user Id :>> ', activeUserId);
    console.log('Following Id :>> ', profileToRemoveType, profileToRemoveId);
    // 2) remove following from active user and his pets
    // 2.1) remove following from active user
    const activeUser = await User.findById(activeUserId);
    profileToRemoveType === 'user'
      ? activeUser.following.userFollowing.remove(profileToRemoveId)
      : activeUser.following.petFollowing.remove(profileToRemoveId);
    // 2.2) remove following from active user pets
    await activeUser.pets.forEach(async pet => {
      let petToUpdate = await Pet.findById(pet._id);
      profileToRemoveType === 'user'
        ? petToUpdate.following.userFollowing.remove(profileToRemoveId)
        : petToUpdate.following.petFollowing.remove(profileToRemoveId);
      await petToUpdate.save();
    });
    await activeUser.save();
    // 3) add new followers to the profile that the active user wants to follow
    if (profileToRemoveType === 'user') {
      const profileToFollow = await User.findById(profileToRemoveId);
      profileToFollow.followers.userFollowers.remove(activeUserId);
      profileToFollow.followers.petFollowers.remove(...activeUser.pets);
      await profileToFollow.save();
    } else {
      const profileToFollow = await Pet.findById(profileToRemoveId);
      profileToFollow.followers.userFollowers.remove(activeUserId);
      profileToFollow.followers.petFollowers.remove(...activeUser.pets);
      await profileToFollow.save();
    }
    // 4) send updated information
    // res.json(activeUser);
    res.json('DONE UNFOLLOW');
  },

  removeFollower: async (req, res) => {
    // To remove a follower: first, remove follower from active user. Then, remove follower from followings array of the profile to remove.
    // 1) grab request info
    const {
      activeProfileId,
      activeProfileType,
      profileToRemoveId,
      profileToRemoveType,
    } = req.body;
    // console.log('Active user Id :>> ', activeProfileType, activeProfileId);
    // console.log('Follower Id :>> ', profileToRemoveType, profileToRemoveId);
    // 2) remove follower from active profile
    if (activeProfileType === 'user') {
      const activeProfile = await User.findById(activeProfileId);
      profileToRemoveType === 'user'
        ? activeProfile.followers.userFollowers.remove(profileToRemoveId)
        : activeProfile.followers.petFollowers.remove(profileToRemoveId);
      await activeProfile.save();
    } else if (activeProfileType === 'pet') {
      const activeProfile = await Pet.findById(activeProfileId);
      profileToRemoveType === 'user'
        ? activeProfile.followers.userFollowers.remove(profileToRemoveId)
        : activeProfile.followers.petFollowers.remove(profileToRemoveId);
      await activeProfile.save();
    }
    // 3) remove following from follower to remove profile
    if (profileToRemoveType === 'user') {
      const profileToRemove = await User.findById(profileToRemoveId);
      activeProfileType === 'user'
        ? profileToRemove.following.userFollowing.remove(activeProfileId)
        : profileToRemove.following.petFollowing.remove(activeProfileId);
      await profileToRemove.save();
    } else if (profileToRemoveType === 'pet') {
      const profileToRemove = await Pet.findById(profileToRemoveId);
      activeProfileType === 'user'
        ? profileToRemove.following.userFollowing.remove(activeProfileId)
        : profileToRemove.following.petFollowing.remove(activeProfileId);
      await profileToRemove.save();
    }
    // 4) send updated information
    res.json('DONE REMOVING FOLLOWER');
  },

  addFamilyMember: async (req, res) => {
    // to add a family member first, add both users (active user & new family member) to family array, then merge both own pets
    // 1) grab info from request
    const {activeUserId, newFamilyMemberId} = req.body;
    console.log('Active user Id :>> ', activeUserId);
    console.log('New Family Member Id :>> ', newFamilyMemberId);
    // 2) add both users in their respective family arrays
    const activeUser = await User.findById(activeUserId).populate('pets');
    const newFamilyMember = await User.findById(newFamilyMemberId).populate(
      'pets',
    );

    activeUser.family.push(newFamilyMemberId);
    newFamilyMember.family.push(activeUserId);
    // 3) merge own pets from both users
    await activeUser.pets.forEach(pet => {
      if (String(pet.owner) === activeUserId) {
        newFamilyMember.pets.push(pet._id);
      }
    });

    await newFamilyMember.pets.forEach(pet => {
      if (String(pet.owner) === newFamilyMemberId) {
        activeUser.pets.push(pet._id);
      }
    });

    await activeUser.save();
    await newFamilyMember.save();
    // ) send updated info
    res.send('New family member ADDED');
  },

  removeFamilyMember: async (req, res) => {
    // to remove a family member first, remove both users (active user & family member to remove) from family array, then remove both own Pets from pets array
    // 1) grab info from request
    const {activeUserId, familyMemberToRemoveId} = req.body;
    console.log('Active user Id :>> ', activeUserId);
    console.log('New Family Member Id :>> ', familyMemberToRemoveId);
    // 2) remove both users from their respective family arrays
    const activeUser = await User.findById(activeUserId).populate('pets');
    const newFamilyMember = await User.findById(
      familyMemberToRemoveId,
    ).populate('pets');

    activeUser.family.remove(familyMemberToRemoveId);
    newFamilyMember.family.remove(activeUserId);
    // 3) remove own pets from both users Pets array
    await activeUser.pets.forEach(pet => {
      if (String(pet.owner) === activeUserId) {
        newFamilyMember.pets.remove(pet._id);
      }
    });

    await newFamilyMember.pets.forEach(pet => {
      if (String(pet.owner) === familyMemberToRemoveId) {
        activeUser.pets.remove(pet._id);
      }
    });

    await activeUser.save();
    await newFamilyMember.save();
    // ) send updated info
    res.send('New family member ADDED');
  },
};

const express = require('express');
const router = express.Router();

// import user controllers
const userControllers = require('../controllers/user');

// USER ROUTES
router.post('/getUserById', userControllers.getUserById);

router.post('/ownPosts', userControllers.getOwnPosts);

router.post('/ownPetPosts', userControllers.getOwnPetPosts);

router.post('/followingPosts', userControllers.getFollowingPosts);

router.post('/homePosts', userControllers.getHomePosts);

router.post('/addFollowing', userControllers.addFollowing);

router.post('/removeFollowing', userControllers.removeFollowing);

router.post('/removeFollower', userControllers.removeFollower);

router.post('/addFamilyMember', userControllers.addFamilyMember);

router.post('/removeFamilyMember', userControllers.removeFamilyMember);

module.exports = router;

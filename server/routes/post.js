const express = require('express');
const router = express.Router();

// import user controllers
const postControllers = require('../controllers/post');

// POSTS ROUTES
router.post('/addPost', postControllers.addPost);

router.post('/deletePost', postControllers.deletePost);

router.post('/addLike', postControllers.addLike);

router.post('/removeLike', postControllers.removeLike);

router.post('/addComment', postControllers.addComment);

router.post('/deleteComment', postControllers.deleteComment);

module.exports = router;

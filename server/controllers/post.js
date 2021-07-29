const express = require('express');

// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Comment = require('../models/comment');

// INDEX CONTROLLERS
module.exports = {
  addPost: async (req, res) => {
    // We should add the post to each profile, each profile will have 'the same post' but with different Post Id
    // 1) grab request info
    const {profiles, post} = req.body;
    console.log('Profiles to add Post :>>', profiles);
    console.log('Post info :>>', post);
    // 2) create Post and add it to each profile
    profiles.forEach(async profile => {
      let profileToAddPost;
      let newPost;
      if (profile.profileType === 'user') {
        // create new post
        newPost = new Post({
          mediaFile: post.mediaFile,
          description: post.description,
          location: post.location,
          author: {userAuthor: profile.profileId},
          likes: {},
          comments: [],
        });
        await newPost.save();
        // add post to profile
        profileToAddPost = await User.findById(profile.profileId);
        await profileToAddPost.posts.push(newPost._id);
        await profileToAddPost.save();
      } else {
        // create new post
        newPost = new Post({
          mediaFile: post.mediaFile,
          description: post.description,
          location: post.location,
          author: {petAuthor: profile.profileId},
          likes: {},
          comments: [],
        });
        await newPost.save();
        // add post to profile
        profileToAddPost = await Pet.findById(profile.profileId);
        await profileToAddPost.posts.push(newPost._id);
        await profileToAddPost.save();
      }
    });
    // send information with the updated profile
    res.json(`Added Post to :>> ' ${profiles}`);
  },

  deletePost: async (req, res) => {
    // To delete a post: first, delete post from user profile posts array. Then, delete the post from posts collection
    // 1) grab data from request
    const {postId, profileId, profileType} = req.body;
    console.log('Post Id :>> ', postId);
    console.log('Profile type :>> ', profileType, profileId);
    // 2) delete post from profile posts array
    if (profileType === 'user') {
      const userToDeletePost = await User.findById(profileId);
      userToDeletePost.posts.remove(postId);
      await userToDeletePost.save();
    } else if (profileType === 'pet') {
      const petToDeletePost = await Pet.findById(profileId);
      petToDeletePost.posts.remove(postId);
      await petToDeletePost.save();
    }
    // 3) delete post from collection
    await Post.findByIdAndDelete(postId);
    // 4) send updated info
    res.send('DONE');
  },

  addLike: async (req, res) => {
    // To add a like: first grab Ids then query the post and add the ids to userLikes and petLikes
    // 1) grab user, pets and post id from request
    const {userId, petsId, postId} = req.body;
    console.log('User Id :>> ', userId);
    console.log('Pets Id :>> ', petsId);
    console.log('Post Id :>> ', postId);
    // 2) search post where we want to add likes
    let post = await Post.findById(postId);
    // console.log('Post to be update :>> ', post);
    // 3) add likes to post
    post.likes.userLikes.includes(userId)
      ? null
      : post.likes.userLikes.push(userId);
    petsId.forEach(pet => {
      post.likes.petLikes.includes(pet._id)
        ? null
        : post.likes.petLikes.push(pet._id);
    });
    // console.log('Updated post :>> ', post);
    // 4) save post
    await post.save();
    // 5) respond with new data
    post = await Post.findById(postId)
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
      .populate('comments');
    res.json([...post.likes.userLikes, ...post.likes.petLikes]);
  },

  removeLike: async (req, res) => {
    // To remove a like: first grab Ids then query the post and remove the ids from userLikes and petLikes
    // 1) grab user, pets and post id from request
    const {userId, petsId, postId} = req.body;
    console.log('User Id :>> ', userId);
    console.log('Pets Id :>> ', petsId);
    console.log('Post Id :>> ', postId);
    // 2) search post where we want to remove likes
    let post = await Post.findById(postId);
    console.log('Post to be update :>> ', post);
    // 3) remove likes to post
    post.likes.userLikes.remove(userId); // Can be implemented by check whether the id exists or not
    post.likes.petLikes.remove(...petsId);
    console.log('Updated post :>> ', post);
    // 4) save post
    await post.save();
    // 5) respond with new data
    post = await Post.findById(postId)
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
      .populate('comments');
    res.json([...post.likes.userLikes, ...post.likes.petLikes]);
  },

  addComment: async (req, res) => {
    // To add a comment: first find the post where the comment belongs, then: create and save the comment on DB, finally: bind the comment to the post.
    // 1) grab info from request and author id
    const {postId, comment, authorId, authorType} = req.body;
    console.log('Post :>> ', postId);
    console.log('Author :>> ', authorType, authorId);
    console.log('Comment :>> ', comment);
    // 2) find post to add comment
    const post = await Post.findById(postId);
    // 3) create and save comment
    let newComment = null;
    if (authorType === 'user') {
      newComment = new Comment({
        comment: comment,
        author: {userAuthor: authorId},
      });
    } else if (authorType === 'pet') {
      newComment = new Comment({
        comment: comment,
        author: {petAuthor: authorId},
      });
    }

    await newComment.save();
    // 5) bind comment to post and save
    post.comments.push(newComment);
    await post.save();
    // 6) respond with new data
    const updatedPost = await Post.findById(postId).populate({
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
    });
    res.json(updatedPost.comments);
  },

  deleteComment: async (req, res) => {
    // To delete a comment: first, delete comment from comments array in Post. Then, delete the comment from comments collection
    // 1) grab data from request
    const {commentId, postId} = req.body;
    console.log('Post Id :>> ', postId);
    console.log('Comment Id :>> ', commentId);
    // 2) delete comment from post
    let postToBeModified = await Post.findById(postId);
    postToBeModified.comments.remove(commentId);
    await postToBeModified.save();
    // 3) delete comment from collection
    await Comment.findByIdAndDelete(commentId);
    // 4) send updated Post comments
    let updatedPost = await Post.findById(postId)
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

    res.json(updatedPost.comments);
  },
};

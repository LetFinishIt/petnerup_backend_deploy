const express = require('express');

// Import models
const User = require('../models/user');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

// // INDEX CONTROLLERS
module.exports = {
  //new conversation
  getUserChat: async (req, res) => {
    const {senderId, receiverId, recieverType, senderType} = req.body;
    const newConversation = new Conversation({
      members: [senderId, receiverId],
      receieverType: recieverType,
      senderType: senderType,
    });
    try {
      const savedConversation = await newConversation.save();
      let userChat;
      let petChat;
      if (savedConversation.receieverType === 'user') {
        userChat = await User.findById(savedConversation.members[1]).lean();
        userChat.ConversationId = savedConversation._id;
        res.send(userChat);
      } else {
        petChat = await Pet.findById(savedConversation.members[1]).lean();
        petChat.ConversationId = savedConversation._id;
        res.send(petChat);
      }
      // });
      // setTimeout(() => {
      //   //const chat = await Pet.findById(conversation[0].members[1]);
      //   console.log('print from new add user or pet', newArray);
      //   res.send(newArray);
      console.log('new conversation save');
      // }, 1000);
      // console.log('new conversation save');
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getChatUserId: async (req, res) => {
    try {
      // problem with req.params.userId is not a string . string is required for $ in search function
      const {userId} = req.body;
      const conversation = await Conversation.find({
        members: {$in: [userId]},
      });
      //res.status(200).json(conversation);
      //console.log('print out ', conversation[0]);
      let newArray = [];
      //const chat = await Pet.findById(conversation[0].members[1]);
      conversation.forEach(async element => {
        let userChat;
        let petChat;
        let userReceiverChat;
        let petReceiverChat;
        if (element.receieverType === 'user') {
          userChat = await User.findById(element.members[1]).lean();
          userChat.ConversationId = element._id;
          // handle for sender
          if (element.senderType === 'user') {
            userReceiverChat = await User.findById(element.members[0]).lean();
            userChat.senderProfilePicture = userReceiverChat.profilePicture;
            userChat.senderUserName = userReceiverChat.username;
            userChat.senderId = userReceiverChat._id;
            newArray.push(userChat);
          } else {
            userReceiverChat = await Pet.findById(element.members[0]).lean();
            userChat.senderProfilePicture = userReceiverChat.profilePicture;
            userChat.senderUserName = userReceiverChat.username;
            userChat.senderId = userReceiverChat._id;
            newArray.push(userChat);
          }
        } else {
          petChat = await Pet.findById(element.members[1]).lean();
          petChat.ConversationId = element._id;
          //comment when we allow pet to send message as well
          if (element.senderType === 'user') {
            petReceiverChat = await User.findById(element.members[0]).lean();
            petChat.senderProfilePicture = petReceiverChat.profilePicture;
            petChat.senderUserName = petReceiverChat.username;
            petChat.senderId = petReceiverChat._id;
            newArray.push(petChat);
          } else {
            petReceiverChat = await Pet.findById(element.members[0]).lean();
            petChat.senderProfilePicture = petReceiverChat.profilePicture;
            petChat.senderUserName = petReceiverChat.username;
            petChat.senderId = petReceiverChat._id;
            newArray.push(petChat);
          }
          //newArray.push(element._id);
        }
      });
      setTimeout(() => {
        //const chat = await Pet.findById(conversation[0].members[1]);
        console.log(newArray);
        res.send(newArray);
        console.log('testing timeout');
      }, 1000);
      // console.log(chat);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteConversation: async (req, res) => {
    const {conversationId} = req.body;
    console.log('print out conversation id ', conversationId);
    await Conversation.findByIdAndDelete(conversationId);
    await Message.findOneAndDelete({
      conversationId: conversationId,
    });
    //await deleteMessage.save();
    console.log('sucessfully remove the conversation');
  },

  testing: async (req, res) => {
    // 1) grab info from request
    // console.log('Pet Id :>> ', petId);
    // 2) find user by id
    console.log('tesing the connection');
    //   .populate({path: 'posts', options: {sort: {dateCreated: 'desc'}}})
    //   .populate('owners');
    // console.log('Pet Info :>> ', pet);
    // 3) send inf
  },
};

// change add chat to the model user similar to post

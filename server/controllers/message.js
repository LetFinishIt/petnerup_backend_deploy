const express = require('express');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

module.exports = {
  //new message

  // this already work so move on
  postNewMessage: async (req, res) => {
    const {conversationId, textDescription, senderId} = req.body;
    const newMessage = new Message({
      conversationId: conversationId,
      text: textDescription,
      sender: senderId,
    });

    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getMessage: async (req, res) => {
    try {
      const {conversationId} = req.body;
      const messages = await Message.find({
        conversationId: conversationId,
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  testing: async (req, res) => {
    console.log('tesing the connection');
  },
};

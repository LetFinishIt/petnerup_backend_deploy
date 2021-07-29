const Conversation = require('../models/conversation');

let users = [];

const addUser = (userId, socketId) => {
  // if socketId exist => swap new userId with old userId
  // !users.some(user => user.userId === userId) && users.push({userId, socketId});
  const index = users.findIndex(el => el.socketId === socketId);
  console.log('look inside the socketId', socketId);
  users.some(user => user.socketId === socketId || user.userId === userId)
    ? (users[index] = {userId: userId, socketId: socketId})
    : users.push({userId, socketId});
};

const removeUser = socketId => {
  try {
    users = users.filter(user => user.socketId !== socketId);
  } catch (err) {
    return {error: err.message};
  }
};

const getUser = userId => {
  return users.find(user => user.userId === userId);
};

module.exports = io => {
  io.on('connection', socket => {
    //when ceonnect
    console.log('a user connected.');

    //take userId and socketId from user
    socket.on('addUser', userId => {
      // addUser(userId, `${socket.id}--${userId}`);
      addUser(userId, socket.id);
      io.emit('getUsers', users);
      console.log('total user log in ', users);
    });
    //send and get message
    socket.on('sendMessage', ({senderId, receiverId, text}) => {
      console.log('print out the receiver id', receiverId);
      console.log('print out the sender', senderId);
      const user = getUser(receiverId);
      console.log('print out user type ', user);
      console.log('print everything ', users);
      //console.log('print out the user', users);
      !(typeof user === 'undefined') &&
        io.to(user.socketId).emit('getMessage', {text, senderId});
      // io.emit('getMessage', {text, senderId, messageId});
      // console.log('finish get message', senderId);
    });

    //when disconnect
    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUser(socket.id);
      io.emit('getUsers', users);
    });
  });
};

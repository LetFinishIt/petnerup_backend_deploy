//////////////////////////////////////////////////////////////////////////////////////////
// THIRD PARTY MODULES
//////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const http = require('http');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// Initialize app with express
const app = express();
// const server = http.createServer(app);
const server = require('http').createServer(app);
// const io = socketIo(server).sockets;
const io = require('socket.io')(server);
const PORT = 3000;
const fileupload = require('express-fileupload');

//////////////////////////////////////////////////////////////////////////////////////////
// CONFIGURATIONS
//////////////////////////////////////////////////////////////////////////////////////////

// MongoDB Config
const DB_URL = process.env.MONGO_URL;
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'Connection Error: '));
mongoDB
  .once('open', () => {
    console.log('Successfully connected to MongoDB...');
  })
  .then(() => {
    //   create seed data - ONCE
    //1)
    // const generateSeedDB = require('./seedDB/index').seedDB;
    // generateSeedDB().then(() => {
    //   mongoDB.close().then(() => console.log('MongoDB connection closed.'));
    // });
    // 2)
    // const bindInfo = require('./seedDB/index').bindInfo;
    // bindInfo();
  })
  .catch(e => {
    console.log(e.message);
  });

//////////////////////////////////////////////////////////////////////////////////////////
// MIDDLEWARE
//////////////////////////////////////////////////////////////////////////////////////////

// Body parser
app.use(logger('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended: false}));
app.use(fileupload({useTempFiles: true}));

// Mongo sanitizer
app.use(mongoSanitize()); // TO PREVENT MONGO INJECTION ATTACK

// Routes
const requireToken = require('./middleware/requireToken');
const User = require('./models/user');
app.get('/', requireToken, (req, res) => {
  res.send({email: req.user.email});
});
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/post', require('./routes/post'));
app.use('/pet', require('./routes/pet'));
app.use('/conversation', require('./routes/conversation'));
app.use('/message', require('./routes/message'));
app.use('/wallet', require('./routes/wallet'));
app.use('/transaction', require('./routes/transaction'));

/** Chatroom routes */
require('./middleware/socket')(io);

// Start server
// app.listen(PORT, () => {
//   console.log('Server running on port: ' + PORT);
// });
server.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
});

// reset function for coin claim
const {resetFunction} = require('../server/controllers/wallet');
//reset every 23 hours
setInterval(async () => resetFunction(), 1000 * 60 * 60 * 24);
// const io = socketIo(
//   app.listen(PORT, () => {
//     console.log('Server running on port: ' + PORT);
//   }),
// )

const express = require('express');
const routes = require('./routes');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const configDB = require('./config/database.js');

const app = new express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser());

routes(app); // api

//socket io setting
const server = http.createServer(app);
const io = require('socket.io')(server);

server.listen(port, function() {
  console.log('listen on ' + port);
});
//io 
io.on('connection', function (socket) { //user come in
  console.log('a user connected');

  mongoose.connect(configDB.url, function(err, db) {
    let collection = db.collection('chat message');
    let stream = collection.find().sort({ _id : -1 }).limit(10).stream(); //get last 10 messages
    stream.on('data', function(chat) { socket.emit('chat', chat.content); //io emit the message
	}); 
  });

  socket.on('disconnect', function() { //user leave
  console.log('a user disconnected');
  });

  socket.on('chat', function(name, msg) { //user enter message
    mongoose.connect(configDB.url, function(err, db) {
	  let collection = db.collection('chat messages');
	  collection.insert({ username : name, content : msg}, function(err, o) {
		if (err) {
		  console.log(err.message);
		} else { 
		  console.log("chat message inserted into db:" + msg); }
	  });
    });
  socket.broadcast.emit('chat', msg);
  });

});

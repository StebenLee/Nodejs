const express = require('express');
const routes = require('./routes');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const configDB = require('./config/database.js');

const app = new express();
const port = process.env.PORT || 3000;

mongoose.connect(configDB.url);
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

io.on('connection', function (socket) { //user enter
  console.log('a user connected');

  socket.on('disconnect', function() { //user leave
  console.log('a user disconnected');
  });

  socket.on('chat', function(msg) {
  	socket.broadcast.emit('chat', msg);
  });
});

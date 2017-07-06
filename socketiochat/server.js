const express = require('express');
const routes = require('./routes');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;
const configDB = require('./config/database.js');

const app = new express();
const port = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser());

routes(app); // api

//socket io setting
const server = http.createServer(app);
const io = require('socket.io')(server);
app.use('/static', express.static(__dirname + '/public'));
server.listen(port, function() {
  console.log('listen on ' + port);
});
//io 
io.on('connection', function(socket) { //user come in
  

  socket.on('add user', function(msg){
    socket.username = msg;
    console.log("new user:"+msg+"logged.");
    socket.broadcast.emit('add user' ,{
      username: socket.username
    });
  });

  mongo.connect(configDB.url, function(err, db) {
    let collection = db.collection('chat messages');
    let stream = collection.find().stream(); //get messages
    stream.on('data', function(chat) { socket.emit('chat', chat.name+" 說 : "+chat.content ); //io emit the message
	}); 
  });

  socket.on('disconnect', function() { //user leave
  console.log(socket.username+'disconnected');
      socket.broadcast.emit('user left',{
        username:socket.username
      });
  });

  socket.on('chat', function(msg) { //user enter message
    mongo.connect(configDB.url, function(err, db) {
	    let collection = db.collection('chat messages');
	    collection.insert({ name : socket.username , content : msg}, function(err, o) {
		  if (err) {
		    console.log(err.message);
		  } else { 
		    console.log(socket.username +" inserted : "+ msg +" into db"); }
	    });
    });
    socket.broadcast.emit('chat', socket.username+" 說 : "+msg);
  });

});

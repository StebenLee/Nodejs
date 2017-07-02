//server.js
import Express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import flash from 'connect-flash';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import configDB from './config/database.js';

const app = new Express();
const port = process.env.PORT || 8000;

mongoose.connect(configDB.url); ;// connect to database
require('./config/passport')(passport);

// set up express
app.use(morgan('dev')); //log every request to the console
app.use(cookieParser()); //read cookies (for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); //ejs for templating

//required for passport
app.use(session({ secret: 'passportpractice'})); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persisten logni sessions 
app.use(flash()); // use connect-flash for flash messages stored in session

//routes 
require('./controllers/routes.js')(app, passport); //load routes and pass in app and  configured passport
//app.use('/', apiRouters(app, passport));
//launch
app.listen(port);
console.log('listen on the port' + port);


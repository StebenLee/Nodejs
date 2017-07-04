import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import User from '../models/user';

import configAuth from './auth';

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	  	done(err, user);
	  });
	});
	//Local login-----------------------------
	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		if(email)
			email = email.toLowerCase();

		//async
		process.nextTick(function() {
			User.findOne({ 'local.email' : email }, function(err, user) {
				if (err)
					return done(err);

				if (!user)
					return done(null, false, req.flash('loginMessage', 'No user found.'));

				if(!user.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'Wrong password.'));

				else 
					return done(null, user);
			});
		});
	}));

	//Local signup----------------------------
	passport.use('local-signup', new LocalStrategy ({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true // allows us to pass back the entire request to the ccallback
	},
	function(req, email, password, done) {
		if(email)
			email = email.toLowerCase();//Use lower-case e-mails to avoid case-sensitive email matching
		
		//async
		//User.findOne wont fire unless data is sent back
		process.nextTick(function() {
			//if user is not already logged in:
			if(!req.user) {
				User.findOne({ 'local.email' : email }, function(err, user) {
					//if there are any errors, return the error
					if (err)
					  return done(err);

					if(user) {
						return done(null, false, req.flash('signupMessage', 'That email is already taken'));
					} else {
						//create the user
						let newUser = new User();
						newUser.local.email = email;
						newUser.local.password = newUser.generateHash(password);

						newUser.save(function(err) {
							if (err)
								return done(err);

							return done(null, newUser);
						});
					}
				});
				//if the user is logged in but has no local account
			} else if( !req.user.local.email ) {
			  //they are trying to connect a local account
			  User.findOne({ 'local.email' : email }, function(err, user) {
			    if (err) 
			      return done(err);
			  	if (user) {
			  		return done(null, flase, req.flash('loginMessage', 'That email is already taken.'));
			  	} else {
			  		let user = req.user;
			  		user.local.email = email;
			  		user.local.password = user.generateHash(password);
			  		user.save(function (err) {
			  			if (err)
			  				return done(err);
			  			return done(null,user);
			  		});
			  	}
			  });
			} else {
				//user is logged in and already has a local account.Ignore signup.
				return done(null, req.user);
			}
		});//process.nextTick
	}));

	//Facebook---------------------------------------------
	const fbStrategy = configAuth.facebookAuth;
	fbStrategy.passReqToCallback = true;
	passport.use(new FacebookStrategy(fbStrategy,
	function(req, token, refreshToken, profile, done) {

		//async
		process.nextTick(function() {

			// check if the user is already logged in
			if (!req.user) {

				User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
					if (err)
						return done(err);
					if(user) {

						if(!user.facebook.token) {
							user.facebook.token = token;
							user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
							user.facebook.email = (profile.emails[0].value || '').toLowerCase();

							user.save(function(err) {
								if (err)
									return done(err);

								return done(null, user);
							});
						}
						return done(null, user); //user found, return that user
					} else {
						let newUser = new User();

						newUser.facebook.id = profile.id;
						newUser.facebook.token = token;
						newUser.facebook.name = profile.name.giveName + ' ' + profile.name.familyName;
						newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

						newUser.save(function(err) {
							if(err)
								return done(err);
							return done(null, newUser);
						});
					}
				});
			} else {
				let user = req.user;

				user.facebook.id = profile.id;
				user.facebook.token = token;
				user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
				user.facebook.email = (profile.emails[0].value || '').toLowerCase();

				user.save(function(err) {
					if (err)
						return done(err);

					return done(null, user);
				});

			}
		});
	}));

	//Twitter-------------------------------------------------
	passport.use(new TwitterStrategy({
		consumerKey : configAuth.twitterAuth.consumerKey,
		consumerSecret : configAuth.twitterAuth.consumerSecret,
		callbackURL :configAuth.twitterAuth.callbackURL,
		passReqToCallback : true
	},
	function(req, token, tokenSecret, profile, done) {
		//async
		process.nextTick(function() {

			//check if the user is already logged in
			if (!req.user) {
				User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
					if(err)
						return done(err);
					if(user) {
						//if there is a user id already but no token
						if(!user.twitter.token) {
							user.twitter.token = token;
							user.twitter.username = profile.username;
							user.twitter.displayName = profile.displayName;

							user.save(function(err) {
								if(err)
									return done(err);
								return done(null, user);
							});

							return done(null, user); //user found, return that user
						} else { 
							let newUser = new User();

							newUser.twitter.id = profile.id;
							newUser.twitter.token = token;
							newUser.twitter.username = profile.username;
							newUser.twitter.displayName = profile.displayName;

							newUser.save(function(err) {
								if(err)
									return done(err);
								return done(null, newUser);
							});
						}
					}
				});
			} else {
				//user already exists and is logged in, we have to link accounts
				let user = req.user; //pull the user out of the seesion

				user.twitter.id = profile.id;
				user.twitter.token = token;
				user.twitter.username = profile.name;
				user.twitter.displayName = profile.displayName;

				user.save(function(err) {
					if(err)
						return done(err);
					return done(null, user);
				});
			}

		});
	}));

	//Google-------------------------------------------------------
	passport.use(new GoogleStrategy({

		clientID : configAuth.googleAuth.clientID,
		clientSecret : configAuth.googleAuth.clientSecret,
		callbackURL : configAuth.googleAuth.callbackURL,
		passReqToCallback : true //allow us to pass in the req from the route

	},
	function(req, token, refreshToken, profile, done) {
		//async
		process.nextTick(function() {
			//check if the user is already logged in
			if(!req.user) {//user is unlogged
				User.findOne({ 'google.id' : profile.id }, function(err, user) {
					if (err)
						return done(err);
					if (user) {//user is signup

						//if there is a user id but no google token
						if (!user.google.token) {
							user.google.token = token;
							user.google.name = profile.displayName;
							user.google.email = (profile.emails[0].value || '').toLowerCase();

							user.save(function(err) {
								if(err)
									return done(err);
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						let newUser = new User();

						newUser.google.id = profile.id;
						newUser.google.token = token;
						newUser.google.name = profile.displayName;
						newUser.google.email = (profile.emails[0].value || '').toLowerCase();
					}
				});
			} else {
				let user = req.user;

				user.google.id = profile.id;
				user.google.token = token;
				user.google.name = profile.displayName;
				user.google.email = (profile.emails[0].value || '').toLowerCase();

				user.save(function(err) {
					if (err)
						return done(err);

					return done(null, user);
				});
			} 
		});
	}));

};
export default = function(app, passport) {
	//Home
	app.get('/', function(req, res) {
	  res.render('index.ejs'); // load the index.ejs
	});

	//Profile
	app.get('/profile', isLoggedIn, function(req, res) {
	  res.render('profile.ejs', {
	  	user : req.user
	  });
	});

	//Logout
	app.get('/logout', function(req, res) {
	  req.logout();
	  res.redirect('/');
	});

	//Authenticate (first login)===========================================
	
	// locally-----------------------------------------
	app.get('/login', function(req, res){
	  res.render('login.ejs', {message: req.flash('loginMessage') });// render the page and pass in any flash data
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
	  successRedirect: '/profile', //redirect to the secure profile section
	  failureRedirect: '/login', //redirect back to the signup if there is an error
	  failureFlash: true //allow flash messages
	}));

	//Signup
	//show the signup form
	app.get('/signup', function(req, res) {
	  res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	//process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
	  successRedirect: '/profile',
	  failureRedirect: '/login',
	  failureFlash: true
	}));

	// facebook----------------------------------------
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

	//handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
	  	successRedirect: '/profile',
	  	failureRedirect: '/'
	  }));

	//twitter------------------------------------------
	app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
	// handle the callback
	app.get('/auth/twitter/callback',
      passport.authenticate('twitter', {
      	successRedirect: '/profile',
      	failureRedirect: '/'
      }));
	//google------------------------------------------
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	//the callback after google has authenticated the user
	app.get('/auth/google/callback',
	  passport.authenticate('google', {
	    successRedirect: 'profile',
	    failureRedirect: '/'
	  }));

	//Authorize (already logged in)============================================
	//locally--------------------------------------------
	app.get('/connect/local', function(req, res) {
	  res.render('connect-local.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
	  successRedirect: '/profile',
	  failureRedirect: '/connect/local',
	  failureFlash: true
	}));

	//facebook------------------------------------------
	app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
	//handle the callback
	app.get('/connect/local/callback',
		passport.authorize('facebook', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));

	//twitter-------------------------------------------
	//send to twitter to do the authentication
	app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
	//handle the callback after twitter has authorized the user
	app.get('/connect/twitter/callback',
		passport.authorize('twitter', {
		  successRedirect: '/profile',
		  failureRedirect: '/'
		}));

	//google---------------------------------------------
	// send to google to do the authentication
	app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email']}));

	//the callback after google has authorized the user
	app.get('/connect/google/callback',
		passport.authorize('google', {
		  successRedirect: '/profile',
		  failureRedirect: '/'
		}));

	//Unlink accounts====================================
	//used to unlink accounts,
	//for social accounts, just remove the token
	//for local account, remove email and password
	//user account will stay active in case they want to reconnet in the future

	//local---------------------------------------------
	app.get('/unlink/local', isLoggedIn, function(req, res) {
	  var user = req.user;
	  user.local.email = undefined;
	  user.local.password = undefined;
	  user.save(function(err) {
	    res.redirect('/profile');
	  });
	});

	//facebook-------------------------------------------
	app.get('/unlink/local', isLoggedIn, function(req, res) {
	  var user = req.user;
	  user.facebook.token = undefined;
	  user.save(function(err) {
	  	res.redirect('/profile');
	  });
	});

	//twitter---------------------------------------------
	app.get('/unlink/facebook', isLoggedIn, function(req, res) {
	  var user = req.user;
	  user.twitter.token = undefined;
	  user.save(function(err) {
	    res.redirect('/profile');
	  });
	});

	//google-----------------------------------------------
	app.get('/unlink/google', isLoggedIn, function(req, res) {
	  var user = req.user;
	  user.google.token = undefined;
	  user.save(function(err) {
	  	res.redirect('/profile');
	  }); 
	});

};

  //route middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
    	return next();

    res.redirect('/');
}
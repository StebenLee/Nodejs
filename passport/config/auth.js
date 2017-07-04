export default ({
	'facebookAuth' : {
		'clientID' : '',
		'clientSecret' : '',
		'callbackURL' : 'http://localhost:8080/auth/facebook/callback',
		'profileURL' : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

	},

	'twitterAuth' : {
		'consumerKey' : '',
		'consumerSecret' : '',
		'callbackURL' : 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' : '',
		'clientSecret' : '',
		'callbackURL' : 'http://localhost:8080/auth/google/callback'
	}

});
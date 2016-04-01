'use strict';

module.exports = {
	// 'githubAuth': {
	// 	'clientID': process.env.GITHUB_KEY,
	// 	'clientSecret': process.env.GITHUB_SECRET,
	// 	'callbackURL': process.env.APP_URL + 'auth/github/callback'
	// },
	
	'openIDAuth': {
		'returnURL': process.env.APP_URL + 'auth/openid/return',
		'realm' : process.env.APP_URL
	},
	
	'secret': process.env.APP_SECRET,
	
};

'use strict';

var OpenIDStrategy = require('passport-openid').Strategy;

//var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new OpenIDStrategy({
			returnURL: configAuth.openIDAuth.returnURL,
			realm: configAuth.openIDAuth.realm
		},
		function(identifier, done) {
			// asynchronous verification, for effect...
			process.nextTick(function() {

				User.findOne({
					'openid.id': identifier
				}, function(err, user) {
					if (err) {
						return done(err);
					}
					if (user) {
						return done(null, user);
					}
					else {
						var newUser = new User();

						newUser.openid.id = identifier;
						//newUser.github.username = profile.username;
						//newUser.github.displayName = profile.displayName;
						//newUser.github.publicRepos = profile._json.public_repos;
						//newUser.nbrClicks.clicks = 0;

						newUser.save(function(err) {
							if (err) {
								throw err;
							}

							return done(null, newUser);
						});
					}
				});

			});
		}
	));

	// passport.use(new GitHubStrategy({
	// 	clientID: configAuth.githubAuth.clientID,
	// 	clientSecret: configAuth.githubAuth.clientSecret,
	// 	callbackURL: configAuth.githubAuth.callbackURL
	// },
	// function (token, refreshToken, profile, done) {
	// 	process.nextTick(function () {
	// 		User.findOne({ 'github.id': profile.id }, function (err, user) {
	// 			if (err) {
	// 				return done(err);
	// 			}

	// 			if (user) {
	// 				return done(null, user);
	// 			} else {
	// 				var newUser = new User();

	// 				newUser.github.id = profile.id;
	// 				newUser.github.username = profile.username;
	// 				newUser.github.displayName = profile.displayName;
	// 				newUser.github.publicRepos = profile._json.public_repos;
	// 				newUser.nbrClicks.clicks = 0;

	// 				newUser.save(function (err) {
	// 					if (err) {
	// 						throw err;
	// 					}

	// 					return done(null, newUser);
	// 				});
	// 			}
	// 		});
	// 	});
	//}));
};

'use strict';

var path = process.cwd();
var PollsController = require(path + '/app/controllers/pollsController.js');

var express = require("express")


module.exports = function(app, passport, csrf) {

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		else {
			res.redirect('/#/login');
		}
	}

	var pollsController = new PollsController();

	var defaultRoute = express.Router();
	var csrfExcludedRoutes = express.Router();

	defaultRoute.use(csrf());
	defaultRoute.use(function(req, res, next) {
		res.cookie('XSRF-TOKEN', req.csrfToken());
		next();
	});


	defaultRoute.route('/')
		.get(function(req, res) {
			//res.sendFile(path + '/public/index.html');
			res.render("index", {
				loggedIn: req.isAuthenticated(),
				user: req.user || {
					_id: req.ip
				},
				appUrl: process.env.APP_URL
			});
		});

	defaultRoute.route('/partials/:name').get(function(req, res) {
		var name = req.params.name;
		res.render('partials/' + name, {
			loggedIn: req.isAuthenticated(),
			user: req.user || {
				_id: req.ip
			},
			appUrl: process.env.APP_URL
		});
	});

	defaultRoute.route('/login')
		.get(function(req, res) {
			//res.sendFile(path + '/public/login.html');
			//res.render("login",{loggedIn:req.isAuthenticated()});
			res.redirect('/#login');
		});

	defaultRoute.route('/logout')
		.get(function(req, res) {
			req.logout();
			res.redirect('/');
		});

	defaultRoute.route('/profile')
		.get(isLoggedIn, function(req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	defaultRoute.route('/api/:id')
		.get(isLoggedIn, function(req, res) {
			res.json(req.user.openid);
		});

	csrfExcludedRoutes.route('/auth/github')
		.get(passport.authenticate('github'));

	csrfExcludedRoutes.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	defaultRoute.route('/polls/:id')
		.get(pollsController.getPoll)
		.delete(isLoggedIn, pollsController.deletePoll);

	defaultRoute.route('/polls/:id/addOption')
		.put(isLoggedIn, pollsController.addOptionPoll);

	defaultRoute.route('/polls/:id/vote')
		.put(pollsController.addVotePoll);

	defaultRoute.route('/polls')
		.get(pollsController.getAllPolls)
		.post(isLoggedIn, pollsController.addPoll);


	csrfExcludedRoutes.route('/auth/openid').post(
		passport.authenticate('openid', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			res.redirect('/');
		});

	// GET /auth/openid/return
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	csrfExcludedRoutes.route('/auth/openid/return').get(
		passport.authenticate('openid', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			res.redirect('/');
		});



	defaultRoute.get('/*', function(req, res, next) {
		res.render("index", {
			loggedIn: req.isAuthenticated()
		});
	});

	app.use(csrfExcludedRoutes);
	app.use(defaultRoute);

};

'use strict';

var Users = require('../models/users.js');
var Polls = require('../models/polls.js');

function PollsHandler() {

	this.getAllPolls = function(req, res) {
		Polls.find()
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				// some privacy
				result.forEach(function(value) {
					value.voters = [];
				});
				res.json(result);
			});
	};

	this.getPoll = function(req, res) {
		Polls.findOne({
				_id: req.params.id
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				result.voters = [];
				res.json(result);
			});
	};

	this.deletePoll = function(req, res) {
		Polls.findOne({
				_id: req.params.id,
				owner: req.user._id
			})
			.remove(function(err, result) {
				if (err) {
					res.status(400);
					res.json({
						error: "Error: Cannot delete poll: " + err
					});
					return;
				}
				if (result.result.n > 0)
					res.sendStatus(204);
				else
					res.sendStatus(403);
			});
	};

	this.addOptionPoll = function(req, res) {
		Polls.findOne({
				_id: req.params.id
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				if (result.options.indexOf(req.body.title.trim()) >= 0) {
					res.sendStatus(409);
					return;
				}
				result.options.push({
					title: req.body.title.trim()
				});
				result.save(function(err) {
					if (err) {
						res.sendStatus(400);
						throw err;
					}
					res.sendStatus(200);
				});
			});
	};

	this.addVotePoll = function(req, res) {
		var voted = req.session.votedFor;
		if (!voted)
			voted = [];
		if (voted.indexOf(req.params.id) > -1) {
			res.status(403);
			res.json({
				error: "Already voted!"
			});
			return;
		}
		else {
			voted.push(req.params.id);
			req.session.votedFor = voted;
		}
		var currentUser;
		if (req.user)
			currentUser = req.user._id;
		else
			currentUser = req.ip;

		Polls.findOne({
				_id: req.params.id
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				if (result.voters.indexOf(currentUser) > -1) {
					res.status(403);
					res.json({
						error: "Already voted!"
					});
					return;
				}
				result.options.forEach(function(i) {
					if (i._id == req.body.optionID)
						i.votes = 1 + (i.votes || 0);
				});
				result.voters.push(currentUser);

				result.save(function(err) {
					if (err) {
						res.sendStatus(400);
						throw err;
					}
					res.sendStatus(200);
				});
			});
	};

	this.getMyPolls = function(req, res) {
		if (req.params.owner === null || !req.params.owner) {
			res.json({});
			return;
		}
		Polls.find({
				owner: req.params.owner
			})
			.exec(function(err, result) {
				if (err) {
					throw err;
				}
				res.json(result);
			});
	};

	this.addPoll = function(req, res) {
		var check_field = function(field) {
			if (req.body[field] === null || !req.body[field]) {
				res.json({
					error: ("field " + field + " missing.")
				});
				return false;
			}
			return true;
		};

		if (!(check_field("title") && check_field("options"))) {
			return;
		}
		var newOptions = req.body["options"].split("\n");
		var newOptionsObject = [];
		newOptions.forEach(function(i) {
			if (i.trim()) {
				newOptionsObject.push({
					title: i.trim()
				});
			}
		});

		var poll = new Polls({
			title: req.body["title"].trim(),
			options: newOptionsObject,
			owner: req.user._id
		});

		poll.save(function(err, result) {
			if (err) {
				res.status(400);
				res.json({
					error: err
				});
				return;
			}
			res.json({
				_id: result._id
			});
		});
	};

}

module.exports = PollsHandler;

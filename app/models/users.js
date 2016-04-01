'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
		publicRepos: Number
	},
	openid: {
		id: String,
		//displayName: String,
		//username: String,
		//publicRepos: Number
	},
	nbrClicks: {
		clicks: Number
	}
});

module.exports = mongoose.model('Vote-App-User', User);

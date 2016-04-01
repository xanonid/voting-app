'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
	title: {
		type: String,
		required: true
	},
	owner: {
		type: String,
		required: true
	},
	options: [{
		title: String,
		votes: Number,
	}],
	voters: [String]
});

module.exports = mongoose.model('Vote-App-Polls', Poll);

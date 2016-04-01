'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
//var cookieParser = require('cookie-parser')
var morgan = require('morgan');
var bodyParser = require('body-parser');
var errorHandler = require('error-handler');
const MongoStore = require('connect-mongo')(session);

var csrf = require('csurf');
//var csrfProtection = csrf({ cookie: false });


var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

var configAuth = require('./app/config/auth');

mongoose.connect(process.env.MONGO_URI);

//app.use(cookieParser())

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/bower_components', express.static(process.cwd() + '/public/bower_components'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(morgan('combined'));

var env = process.env.NODE_ENV;
if (env === 'development') {
  app.use(errorHandler);
}


app.use(bodyParser.urlencoded({ extended: false }));
 // parse application/json 
app.use(bodyParser.json());

app.use(session({
	secret: configAuth.secret,
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	name: "voteApp"
}));


app.use(passport.initialize());
app.use(passport.session());



app.set('view engine', 'jade');
app.enable('trust proxy')

routes(app, passport,csrf);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
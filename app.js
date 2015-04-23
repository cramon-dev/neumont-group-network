var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var connect = require('connect');
var sessions = require('express-session');
//var redis = require('redis');
//var client = redis.createClient();

var routes = require('./routes/index');
var users = require('./routes/users');
var signin = require('./routes/signin');
var signout = require('./routes/signout');
var registration = require('./routes/registration');
var organizations = require('./routes/organizations');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessions({
    secret: 'itsasecret',
    cookie: { expires: (Date.now() + 10000), maxAge: 10000 }, //in milliseconds
    resave: false,
    saveUninitialized: true
}));

//Catch all routes except GET/POST sign in and check if user has a session
//If session doesn't exist, kick them back to sign in screen
//BONUS FEATURE TO IMPLEMENT:
//If they're not logged in and they try to do something, record that action and when they log in and reroute them to the page they were trying to access
app.all(/\/(?!signin)(?!register)(\w+)/, function(req, res, next) {
    if(req.session.username) {
        console.log("Found valid session");
        next();
    }
    else {
        console.log("Could not find session or session has expired, sending user to sign in screen");
        res.render('index', { message: 'You need to be logged in to do that' });
    }
});

//Routes
app.use('/', routes);
app.use('/users', users);
app.use('/signin', signin);
app.use('/signout', signout);
app.use('/register', registration);
app.use('/organizations', organizations);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;


////Sessions
//app.use(sessions({
//    name: 'session',
//    secret: 'blargadeeblargblarg', // should be a large unguessable string
//    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
//    activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
//}));

//client.on('connect', function() {
//    console.log('connected');
//});
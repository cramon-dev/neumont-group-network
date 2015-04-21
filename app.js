var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connect = require('connect');
var sessions = require('express-session');

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
    resave: false,
    saveUninitialized: true
}));

app.use('/', routes);
app.use('/users', users);
app.use('/signin', signin);
app.use('/signout', signout);
app.use('/register', registration);
app.use('/organizations', organizations);


////Sessions
//app.use(sessions({
//    name: 'session',
//    secret: 'blargadeeblargblarg', // should be a large unguessable string
//    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
//    activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
//}));



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

app.get('/test', function(req, res) {
    if(req.session.lastPage) {
        res.write('Last page was: ' + req.session.lastPage + '. ');
    }

    req.session.lastPage = '/test';
    res.send('test page');
});


//app.get('/test', function(req, res) {
//    res.send("test route, username: " + req.session.username);
//});
//
//app.get('/testlogin', function(req, res) {
//    req.session.username = "John";
//});
//
//app.get('/testlogout', function(req, res) {
//    req.session.reset();
//});

module.exports = app;
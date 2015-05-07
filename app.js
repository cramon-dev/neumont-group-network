var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('express-session');
//var redis = require('redis');
//var client = redis.createClient();

var app = express();
var hour = 1000 * 60 * 60;

var index = require('./controllers/index');
var signin = require('./controllers/signin');
var signout = require('./controllers/signout');
var registration = require('./controllers/registration');
var organizations = require('./controllers/organizations');

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
    secret: 'g53hm#v+c=u7(4b#7q*9wds+(j)=i3+j(x4=6joi9v$7v0-gfwn5z',
    cookie: { expires: (Date.now() + hour), maxAge: hour }, //in milliseconds
    resave: false,
    saveUninitialized: true
}));

//Catch all routes except sign in and register and check if user is logged in
app.all(/\/(?!signin)(?!register)(\w+)/, function(req, res, next) {
    if(req.session.user) {
        console.log("Found valid session");
        next();
    }
    else {
        console.log("Could not find session or session has expired, sending user to sign in screen");
        //Should probably check for certain actions, like sign out, so as to prevent them from signing out accidentally
        req.session.lastAction = req.path;
        console.log('Last action taken: ' + req.session.lastAction);
        res.render('index', { message: 'You need to be logged in to do that' });
    }
});

//All other routes
app.use('/', index);
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
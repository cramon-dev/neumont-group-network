var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var multer = require('multer');
var sessions = require('express-session');
// var redis = require('redis');
// var client = redis.createClient();
// console.log('Redis client created: ' + client);

var app = express();
var hour = 1000 * 60 * 60;
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'christianr465@gmail.com',
        pass: 'unaxnwgrztjbtphk'
    }
});

var index = require('./controllers/index');
var signin = require('./controllers/signin');
var signout = require('./controllers/signout');
var registration = require('./controllers/registration');
var organizations = require('./controllers/organizations');
var events = require('./controllers/events');
var search = require('./controllers/search');
var profiles = require('./controllers/profiles');
var messages = require('./controllers/messages');
var users = require('./controllers/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(busboy());
//app.use(bodyParser({ uploadDir: './uploads' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(serveStatic(__dirname + '/public'));
app.use(serveStatic(__dirname + '/uploads'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'uploads')));
app.use(sessions({
    secret: 'g53hm#v+c=u7(4b#7q*9wds+(j)=i3+j(x4=6joi9v$7v0-gfwn5z',
    cookie: { expires: (Date.now() + hour), maxAge: hour }, //in milliseconds
    resave: false,
    saveUninitialized: true
}));

//Multer for image uploading
app.use(multer({
    dest: './uploads/',
//    rename: function (fieldname, filename) {
//        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
//    },
    onFileUploadStart: function(file, req, res) {
        console.log(file.fieldname + ' is starting');
    },
    onFileUploadData: function (file, data, req, res) {
        console.log(data.length + ' of ' + file.fieldname + ' arrived');
    },
    onFileUploadComplete: function (file, req, res) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
    }
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

//Catch all routes except sign in and register and check if user is logged in
app.all(/\/(?!resources)(?!signin)(?!signout)(?!register)(?!favicon.ico)(\w+)/, function(req, res, next) {
    if(req.session.user) {
        console.log("Found valid session");
        next();
    }
    else {
        console.log("Could not find session or session has expired, sending user to sign in screen");
        if(!req.path.indexOf('/favicon.ico' || '/signout') > -1) {
            console.log('Recording last action taken: ' + req.path);
            req.session.lastAction = req.path;
        }
        res.render('index', { message: 'You need to be signed in to do that.' });
    }
});

//All other routes
app.use('/', index);
app.use('/signin', signin);
app.use('/signout', signout);
app.use('/register', registration);
app.use('/organizations', organizations);
app.use('/events', events);
app.use('/search', search);
app.use('/profiles', profiles);
app.use('/messages', messages);
app.use('/users', users);

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
        console.log('Dev error');
        res.status(err.status || 500);
        res.render('error', {
            serverErrorMessage: err.message,
            error: err
        });
        // res.render('prod-error', { serverErrorMessage: err.message }); // Comment this out in dev
    });
}
else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        console.log('Prod error');
        res.status(err.status || 500);
        res.render('prod-error', { serverErrorMessage: err.message });
    });
}


module.exports = app;
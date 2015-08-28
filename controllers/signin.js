var express = require('express');
var router = express.Router();
var userModel = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();


router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var inputs = [ username, password ];
    var inputError = inputValidator.validateInput(inputs);

    // res.json({ username: username });

    //If no invalid input found, authenticate, no errors while authenticating, and the user was authenticated, redirect the user home or to the url they last requested
    if(!inputError) {
        userModel.authenticate(username, password, function(err, user) {
            if(!err && user) {
                console.log('Authentication successful');
                req.session.user = user;
                res.locals.user = user;

                res.redirect('/');
            }
            else {
                if(err) {
                    eventEmitter.emit('authError', req, res, err);
                }
                else if(!user) {
                    eventEmitter.emit('authError', req, res, 'That user doesn\'t exist.');
                }
            }
        });
    }
    else {
        res.render('index', { errorMessage: inputError.message });
    }
});

eventEmitter.on('authError', function(req, res, err) {
    console.log('Authentication error');
    if(/.*ECONNREFUSED/.test(err) || /.*ENOENT/.test(err)) {
        console.log(err);
        console.log('Server error with authentication');
        req.session.errorMessage = 'Something went wrong with our server. Please try signing in in a few minutes.';
        res.redirect('/');
    }
    else {
        req.session.errorMessage = err;
        res.redirect('/');
    }
});

module.exports = router;
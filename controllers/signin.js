var express = require('express');
var router = express.Router();
var inputValidator = require('../models/input-validator.js');
var user = require('../models/user.js');

/* POST credentials */
//Is this adhering to REST? How can I better authenticate a user and make sure their credentials are safe?
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var inputs = [ username, password ];
    var inputError = inputValidator.validateInput(inputs);

    //If no invalid input found, authenticate, no errors while authenticating, and the user was authenticated, redirect the user home or to the url they last requested
    if(!inputError) {
        user.authenticate(username, password, function(err, user) {
            if(!err) {
                if(user) {
                    req.session.user = user;

                    if(req.session.lastAction) {
                        console.log("Redirecting user to last page requested..");
                        res.redirect(req.session.lastAction);
                    }
                    else {
                        res.redirect('/');
                    }
                }
                else {
                    res.render('index', { errorMessage: 'Invalid username or password' });
                }
            }
            else {
                res.render('index', { errorMessage: 'Error while signing in, try again' });
            }
        });
    }
    else {
        res.render('index', { errorMessage: inputError.message });
    }
});

module.exports = router;
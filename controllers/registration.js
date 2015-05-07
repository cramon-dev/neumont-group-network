var express = require('express');
var router = express.Router();
var dbManager = require('../models/db-manager.js');
var inputValidator = require('../models/input-validator.js');
var user = require('../models/user.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register');
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var inputs = [ username, password, email ];
    var inputError = inputValidator.validateInput(inputs);

    if(!inputError) {
        user.registerNewUser(username, password, email, function(err, result) {
            if(!err) {
                req.session.user = { userId: result, username: username, email: email };
                res.redirect('/');
            }
            else {
                console.log('Error registering new user, redirecting to register page');
                res.render('register', { errorMessage: err.message });
            }
        });
    }
    else {
        res.render('register', { errorMessage: inputError.message });
    }
});

module.exports = router;
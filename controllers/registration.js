var express = require('express');
var router = express.Router();
var inputValidator = require('../models/input-validator.js');
var user = require('../models/user.js');
var util = require('util');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register');
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
    var email = req.body.email;
    var userAvatarPath = req.files.newUserAvatar ? req.files.newUserAvatar.name : 'images/default_avatar.png';
    var inputError = inputValidator.validateInput([ username, password, email ]);
    var emailError = inputValidator.validateEmailAddress(email);
    var passwordsMatch = inputValidator.doPasswordsMatch(password, passwordConfirm);

    if(!inputError && !emailError && passwordsMatch) {
        user.registerNewUser(username, password, email, userAvatarPath, function onRegisterNewUser(err, result) {
            if(!err) {
                req.session.user = { userId: result, username: username, email: email, userAvatar: userAvatarPath };
                res.redirect('/');
            }
            else {
                if(err.message.match('ER_DUP_ENTRY')) {
                    res.render('register', { errorMessage: 'That username or email has already been taken' });
                }
                else {
                    throw err;
                    res.render('register', { errorMessage: err.message });
                }
            }
        });
    }
    else {
        if(inputError) {
            res.render('register', { errorMessage: inputError.message });
        }
        else if(emailError) {
            res.render('register', { errorMessage: emailError.message });
        }
        else {
            res.render('register', { errorMessage: 'The inputted passwords don\'t match' });
        }
    }
});


module.exports = router;
var express = require('express');
var router = express.Router();
var userModel = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var util = require('util');


/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register');
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var userAvatar = '/resources/img/default_user_avatar.png';
    if(req.files.userAvatarUpload) {
        userAvatar = req.files.userAvatarUpload.name;
    }
    var inputs = [ username, password, email ];
    var inputError = inputValidator.validateInput(inputs);
    var mailOptions = {
        from: 'NGN Admin <admin@ngn.com>', // sender address
        to: email, // list of receivers
        subject: 'Welcome to NGN', // Subject line
        text: 'Welcome!', // plaintext body
        html: '<p>Thank you for registering an account with the Neumont Group Network! We hope you enjoy your time on our site.</p>'
                    + '<br/><b>Please note, this is an automated email message. Any replies to this email address will be ignored.</b>' // html body
    };
    console.log('User avatar: ' + userAvatar);

    //If the input was valid
    if(!inputError) {
        userModel.registerNewUser(username, password, email, userAvatar, function(err, result) {
            if(!err) {
                // transporter.sendMail(mailOptions, function(error, info){
                //     if(error){
                //         return console.log(error);
                //     }

                //     console.log('Message sent: ' + info.response);
                // });

                req.session.user = { userId: result, username: username, email: email, userAvatar: userAvatar };
                res.redirect('/');
            }
            else {
                eventEmitter.emit('registrationError', req, res, err);
            }
        });
    }
    else {
        eventEmitter.emit('registrationError', req, res, inputError.message);
    }
});

eventEmitter.on('registrationError', function(req, res, err) {
    req.session.errorMessage = err;
    if(err.message.match('ER_DUP_ENTRY')) {
        req.session.errorMessage = 'That username or email has already been taken.';
    }

    res.redirect('register');
});

module.exports = router;
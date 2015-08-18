var express = require('express');
var router = express.Router();
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
    var mailOptions = {
        from: 'NGN Admin <admin@ngn.com>', // sender address
        to: email, // list of receivers
        subject: 'Welcome to NGN', // Subject line
        text: 'Welcome!', // plaintext body
        html: '<p>Thank you for registering an account with the Neumont Group Network! We hope you enjoy your time on our site.</p>'
                    + '<br/><b>Please note, this is an automated email message. Any replies to this email address will be ignored.</b>' // html body
    };

    //If the input was valid
    if(!inputError) {
        user.registerNewUser(username, password, email, function(err, result) {
            if(!err) {
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }

                    console.log('Message sent: ' + info.response);
                });

                req.session.user = { userId: user.user_id, username: user.username };
            }
            else {
                errorMessage = err.message;

                if(err.message.match('ER_DUP_ENTRY')) {
                    errorMessage = 'That username or email has already been taken';
                }

                res.send({ error: errorMessage });
            }
        });
    }
    else {
        res.send(inputError.message);
    }
});


module.exports = router;
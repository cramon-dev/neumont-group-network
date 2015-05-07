var express = require('express');
var router = express.Router();
var dbManager = require('../models/db-manager.js');
var inputValidator = require('../models/input-validator.js');
var user = require('../models/user.js');

/* POST credentials */
//Is this adhering to REST? How can I better authenticate a user and make sure their credentials are safe?
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var inputs = [ username, password ];
    var inputError = inputValidator.validateInput(inputs);

    if(!inputError) {
        user.authenticate(username, password, function(err, user) {
            if(!err) {
                req.session.user = user;
                res.redirect('/');
            }
            else {
                res.render('index', { errorMessage: 'Invalid username or password' });
            }
        });
    }
    else {
        res.render('index', { message: inputError.message });
    }
});

module.exports = router;
var express = require('express');
var router = express.Router();
var dbManager = require('../resources/js/db-manager.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register');
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    try {
        var username = dbManager.checkInvalidInput(req.body.username);
        var password = dbManager.checkInvalidInput(req.body.password);
        var email = dbManager.checkInvalidInput(req.body.email);
        
        dbManager.registerNewUser(username, password, email, function(err) {
            if(!err) {
                req.session.username = username;
                res.redirect('/');
            }
            else {
                res.render('register', { errorMessage: err.message });
            }
        });
    }
    catch(e) {
        res.render('register', { errorMessage: e.message });
    }
});

module.exports = router;
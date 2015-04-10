var express = require('express');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    var username, password, email;
    
    try {
        username = db_manager.checkPotentialMaliciousInput(req.body.username);
        password = db_manager.checkPotentialMaliciousInput(req.body.password);
        email = db_manager.checkPotentialMaliciousInput(req.body.email);
    }
    catch(e) {
        res.render('register', { error_message: e.message });
    }
    
    var db_conn = db_manager.createConnectionToDB();
    db_manager.registerNewUser(db_conn, username, password, email);
    res.render('home', { username: username } ); //render home page with their username to show they're logged in
});

module.exports = router;
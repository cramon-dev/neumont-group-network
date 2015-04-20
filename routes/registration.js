var express = require('express');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register');
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    var username, password, email;
    
    try {
        username = db_manager.checkInvalidInput(req.body.username);
        password = db_manager.checkInvalidInput(req.body.password);
        email = db_manager.checkInvalidInput(req.body.email);
        
        var db_conn = db_manager.createConnectionToDB();
        
        db_manager.registerNewUser(db_conn, username, password, email, function(err) {
            if(!err) {
                res.render('home', { username: username } ); //render home page with their username to show they're logged in
            }
            else {
                res.render('register', { error_message: 'Error registering user.. please try again' });
            }
        });
    }
    catch(e) {
        res.render('register', { error_message: e.message });
    }
});

module.exports = router;
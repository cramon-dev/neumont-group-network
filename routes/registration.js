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
        username = db_manager.checkInvalidInput(req.body.username);
        password = db_manager.checkInvalidInput(req.body.password);
        console.log("password after initializing: " + password);
        email = db_manager.checkInvalidInput(req.body.email);
        
        var db_conn = db_manager.createConnectionToDB();
        if(db_manager.registerNewUser(db_conn, username, password, email, wasUserInsertSuccessful)) {
            res.render('home', { username: username } ); //render home page with their username to show they're logged in
        }
        else {
            res.render('register', { message: 'User insert unsuccessful' });
        }
    }
    catch(e) {
        console.log("Exception caught..");
        console.log(e);
        res.render('register', { title: 'Register', message: e.message });
    }
});

var wasUserInsertSuccessful = function(err, bool) {
    if(err) {
        throw err;
    }
    else {
        return bool;
    }
}

module.exports = router;
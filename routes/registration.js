var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

//Upon successful user account registration, redirect to logged in home page
//Consider moving this to PUT
router.post('/', function(req, res, next) {
    var username, password, email;
    
    try {
        username = db_manager.checkInvalidInput(req.body.username);
        password = db_manager.checkInvalidInput(req.body.password);
        email = db_manager.checkInvalidInput(req.body.email);
    }
    catch(e) {
        console.log("Exception caught..");
        console.log(e);
        res.render('register', { message: e.message });
    }
    
    var db_conn = db_manager.createConnectionToDB();
    if(db_manager.registerNewUser(db_conn, username, password, email)) {
        res.render('home', { username: username } ); //render home page with their username to show they're logged in
    }
});

router.put('/', function(req, res, next) {
    res.send('PUT new user in database');
});

module.exports = router;
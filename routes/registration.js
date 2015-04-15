var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

//Upon successful user account registration, redirect to logged in home page
router.post('/', function(req, res, next) {
    var username, email, hash;
    var salt = bcrypt.genSaltSync(10);
    
    try {
        var password = db_manager.checkInvalidInput(req.body.password);
        username = db_manager.checkInvalidInput(req.body.username);
        email = db_manager.checkInvalidInput(req.body.email);
        
        hash = bcrypt.hashSync(password, salt);
    }
    catch(e) {
        console.log("Exception caught..");
        console.log(e);
        res.render('register', { title: 'Register', message: e.message });
    }
    
    var db_conn = db_manager.createConnectionToDB();
    if(db_manager.registerNewUser(db_conn, username, hash, email)) {
        res.render('home', { username: username } ); //render home page with their username to show they're logged in
    }
    else {
        console.log("registerNewUser doesn't work because fuck you, that's why");
    }
});

module.exports = router;
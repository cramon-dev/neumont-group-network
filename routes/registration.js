var express = require('express');
var router = express.Router();
var registrationCtrl = require('../resources/js/registration-controller.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

//Upon successful user account registration, redirect to logged in home page?
router.post('/', function(req, res, next) {
    var username = req.body.register_username;
    var password = req.body.register_password;
    var email = req.body.register_email;
    var db_conn = registrationCtrl.createConnectionToDB();
    registrationCtrl.insertIntoDB(db_conn, username, password, email);
    //res.render('home', { username: their_username } ); //render home page with their username to show they're logged in?
});

module.exports = router;

var express = require('express');
var router = express.Router();
var registrationCtrl = require('../resources/js/registration-controller.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Register' });
});

//Upon successful user account registration, redirect to logged in home page?
router.post('/', function(req, res, next) {
    var db_conn = registrationCtrl.createConnectionToDB();
    registrationCtrl.executeBasicQuery(db_conn);
    //res.render('home', { username: their_username } ); //render home page with their username to show they're logged in?
});

module.exports = router;

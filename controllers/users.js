var express = require('express');
var router = express.Router();
var user = require('../models/user.js');
var util = require('util');

router.get('/', function(req, res, next) {
    if(user) {
        var user = req.session.user;
        console.log('Session user: ' + util.inspect(user));
        return user;
    }
    else {
        console.log('No user in session');
    }
});

module.exports = router;
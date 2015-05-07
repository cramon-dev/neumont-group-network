var express = require('express');
var router = express.Router();

//Catch all routes except sign in and register and check if user is logged in
router.all(/\/(?!signin)(?!register)(\w+)/, function(req, res, next) {
    if(req.session.user) {
        console.log("Found valid session");
        next();
    }
    else {
        console.log("Could not find session or session has expired, sending user to sign in screen");
        //Should probably check for certain actions, like sign out, so as to prevent them from signing out accidentally
        req.session.lastAction = req.path;
        res.render('index', { message: 'You need to be logged in to do that' });
    }
});

//All other routes
router.use('/signin', require('./signin'));
router.use('/signout', require('./signout'));
router.use('/register', require('./registration'));
//router.use('/organizations', require('./organizations'));

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('Session user object: ' + req.session.user);
    if(req.session.user) {
        var propValue;
        for(var propName in req.session.user) {
            propValue = req.session.user[propName];
            
            console.log(propName + ': ' + propValue);
        }
        console.log('Session user ID: ' + req.session.user.userId);
        console.log('Session username: ' + req.session.user.username);
        res.render('home', { userId: req.session.user.userId, username: req.session.user.username });
    }
    else {
        res.render('index');
    }
});

module.exports = router;
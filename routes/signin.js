var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var dbManager = require('../resources/js/db-manager.js');

/* POST credentials */
//Is this adhering to REST? How can I better authenticate a user and make sure their credentials are safe?
router.post('/', function(req, res, next) {
    var username = dbManager.checkInvalidInput(req.body.username);
    var password = dbManager.checkInvalidInput(req.body.password);

    dbManager.signIn(username, function(err, data) {
        var storedHash = data.password;
        var userId = data.userId;
        
        if(!err) {
            if(bcrypt.compareSync(password, storedHash)) {
                req.session.userId = userId;
                req.session.username = username;
                
                if(req.session.lastAction) {
                    console.log("Redirecting user to last page requested..");
                    res.redirect(req.session.lastAction);
                }
                else {
                    res.render('home', { userId: req.session.userId, username: req.session.username });
                }
            }
            else {
                res.render('index', { message: 'Invalid username or password, try again' });
            }
        }
        else {
            res.render('index', { message: e.message });
        }
    });
});

module.exports = router;
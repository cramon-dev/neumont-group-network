var express = require('express');
var router = express.Router();
var organizations = require('../models/organization.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.user) {
        if(req.session.user.orgs) {
            var message = req.session.message;
            var errorMessage = req.session.errorMessage;
            req.session.message = null;
            req.session.errorMessage = null;

            res.render('home', { userId: req.session.user.userId, username: req.session.user.username, 
                                userAvatar: req.session.user.userAvatar, message: message, errorMessage: errorMessage, listOfOrgs: req.session.user.orgs });
        }
        else {
            organizations.getOrgsUserIsMemberOf(req.session.user.userId, function(err, listOfOrgs) {
                if(!err && listOfOrgs) {
                    var message = req.session.message;
                    var errorMessage = req.session.errorMessage;
                    req.session.message = null;
                    req.session.errorMessage = null;
                    req.session.user.orgs = listOfOrgs;

                    res.render('home', { userId: req.session.user.userId, username: req.session.user.username, 
                                        userAvatar: req.session.user.userAvatar, message: message, errorMessage: errorMessage, listOfOrgs: listOfOrgs });
                }
                else {
                    if(err) {
                        res.render('home', { errorMessage: err.message });
                    }
                    else {
                        res.render('home', { errorMessage: 'Unable to load list of organizations you are a member of. Try again later' });
                    }
                }
            });
        }
    }
    else {
        res.render('index');
    }
});

module.exports = router;
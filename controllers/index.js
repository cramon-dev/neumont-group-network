var express = require('express');
var router = express.Router();
var orgModel = require('../models/organization.js');
var eventModel = require('../models/event.js');
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
    var message = req.session.message;
    var errorMessage = req.session.errorMessage;
    req.session.message = null;
    req.session.errorMessage = null;

    if(req.session.user) {
        if(!req.session.user.orgs) {
            orgModel.getAllOrgsUserIsMemberOf(req.session.user.userId, function(err, listOfOrgs) {
                if(!err) {
                    req.session.user.orgs = listOfOrgs;
                }
                else {
                    return console.error(err);
                }
            });
        }

        if(!req.session.user.events) {
            eventModel.getAllEventsUserIsAttending(req.session.user.userId, function(err, listOfEvents) {
                if(!err) {
                    req.session.user.events = listOfEvents;
                }
                else {
                    return console.error(err);
                }
            });
        }

        console.log('Found a user, redirecting them home');
        // res.render('home', { userId: req.session.user.userId, username: req.session.user.username, 
        //                     userAvatar: req.session.user.userAvatar, message: message, errorMessage: errorMessage });
        res.render('home', { user: req.session.user, message: message, errorMessage: errorMessage, listOfOrgs: req.session.user.orgs, listOfEvents: req.session.user.events });
    }
    else {
        console.log('Did not find a user, redirecting to index page');
        res.render('index', { user: req.session.user, message: message, errorMessage: errorMessage });
    }

});

module.exports = router;
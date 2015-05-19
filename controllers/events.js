var express = require('express');
var router = express.Router();
var events = require('../models/event.js');
var members = require('../models/member.js');
var inputValidator = require('../models/input-validator.js');

// =========== View Event Details ===========

router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var eventId = req.params[0];
    
    events.getEventDetails(eventId, function(err, eventDetails) {
        if(!err) {
            if(eventDetails) {                
//                var detailsToPush = { eventId: eventDetails.event_id, eventTitle: eventDetails. };
                eventDetails.message = req.session.message;
                eventDetails.errorMessage = req.session.errorMessage;
                req.session.message = null;
                req.session.errorMessage = null;
                
                res.render('event', { eventDetails: eventDetails });
            }
            else {
                req.session.errorMessage = 'That event doesn\'t exist';
                res.redirect('/');
            }
        }
        else {
            req.session.errorMessage = err;
            res.redirect('/');
        }
    });
});

// =========== Create/Edit Admin Check ===========

////Check if the user is an admin of the organization they're trying to create/edit an event for
//router.all(/(((\d+)\/edit) || (\/create))/, function(req, res, next) {
//    var orgId = req.query.orgId;
//    var eventId = req.params[0];
//    var userId = req.session.user.userId;
//    
//    if(orgId) {
//        members.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
//            if(!err) {
//                if(result) {
//                    next();
//                }
//                else {
//                    req.session.errorMessage = 'You are not an admin of this organization';
//                    res.redirect('/organizations/' + orgId);
//                }
//            }
//            else {
//                req.session.errorMessage = 'Something went wrong, please try again';
//                res.redirect('/organizations/' + orgId);
//            }
//        });
//    }
//    else if(eventId) {
//        members.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
//            if(!err) {
//                if(result) {
//                    next();
//                }
//                else {
//                    req.session.errorMessage = 'You are not an admin of this organization';
//                    res.redirect('/organizations/' + orgId);
//                }
//            }
//            else {
//                req.session.errorMessage = 'Something went wrong, please try again';
//                res.redirect('/organizations/' + orgId);
//            }
//        });
//    }
//});

// =========== Create ===========

//Get the 'create event' form
router.get('/create', function(req, res, next) {
    var orgId = req.query.orgId;
    
    res.render('create-event', { orgId: orgId });
});

//Create the event
router.post('/create', function(req, res, next) {
    var orgId = req.body.orgId;
    var eventTitle = req.body.newEventTitle;
    var eventDesc = req.body.newEventDesc;
    var eventStartDate = req.body.newEventStartDate;
    var canUsersComment = false;
    if(req.body.canUsersComment) {
        canUsersComment = true;
    }
    var inputError = inputValidator.validateOrgAndEventInput([ eventTitle, eventDesc ]);
    
    if(!inputError) {
        events.addNewEvent(eventTitle, eventDesc, eventStartDate, orgId, canUsersComment, function onAddNewEvent(err, result) {
            if(!err) {
                if(result) {
                    req.session.message = 'Event successfully created';
                    res.redirect('/events/' + result);
                }
                else {
                    res.render('create-event', { orgId: orgId, errorMessage: 'Event unsuccessfully created, try again later or contact the administrator' });
                }
            }
            else {
                res.render('create-event', { orgId: orgId });
            }
        });
    }
    else {
        req.session.errorMessage = inputError.message;
        res.render('create-event', { orgId: orgId });
    }
});


// =========== Edit ===========

//Get the 'edit event' form
router.get(/(\d+)\/edit/, function(req, res, next) {
    res.render('edit-event', { eventId: req.params[0] });
});

//Edit the event details
router.post(/(\d+)\/edit/, function(req, res, next) {
    var eventId = req.params[0];
    var newTitle = req.body.newEventTitle;
    var newDesc = req.body.newEventDesc;
    var newStartDate = req.body.newEventStartDate;
    var canUsersComment = false;
    if(req.body.canUsersComment) {
        canUsersComment = true;
    }
    var inputError = inputValidator.validateOrgAndEventInput([ newTitle, newDesc ]);
    
    if(!inputError) {
        events.editEventDetails(newTitle, newDesc, newStartDate, eventId, canUsersComment, function onEditEvent(err, result) {
            if(!err) {
                if(result) {
                    req.session.message = 'Event details successfully updated';
                    res.redirect('/events/' + eventId);
                }
                else {
                    res.render('edit-event', { eventId: eventId, errorMessage: 'Event information not updated, something went wrong, please try again later' });
                }
            }
            else {
                res.render('edit-event', { eventId: eventId });
            }
        });
    }
    else {
        req.session.errorMessage = inputError.message;
        res.render('edit-event', { eventId: eventId });
    }
});

// =========== Comments ===========

//Get comments for an event
router.get(/(\d+)\/comment/, function(req, res, next) {
    console.log('Get some comments');
    res.redirect('/events/' + req.params[0]);
});

//Post a comment
router.post(/(\d+)\/comment/, function(req, res, next) {
    console.log('Post a comment');
    res.redirect('/events/' + req.params[0]);
});

module.exports = router;
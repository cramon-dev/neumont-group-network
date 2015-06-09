var express = require('express');
var router = express.Router();
var events = require('../models/event.js');
var comments = require('../models/comment.js');
var members = require('../models/member.js');
var attendees = require('../models/attendee.js');
var inputValidator = require('../models/input-validator.js');

// =========== View All Events ===========

router.get(/^\/?$/, function(req, res, next) {
    events.getAllEvents(function onRetrieveEvents(err, listOfEvents) {
        res.render('all-events', { title: 'Events', listOfEvents: listOfEvents });
    });
});


// =========== View Event Details ===========

router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var eventId = req.params[0];
    
    events.getEventDetails(eventId, function(err, eventDetails) {
        if(!err && eventDetails) {
            var newDate = new Date();
            newDate.setTime(eventDetails.start_date * 1000);
            eventDetails.start_date = newDate.toDateString();
                comments.getComments(eventId, function(err, listOfComments) {
                    if(!err && listOfComments) {
                        eventDetails.listOfComments = listOfComments;
                        eventDetails.message = req.session.message;
                        eventDetails.errorMessage = req.session.errorMessage;
                        req.session.message = null;
                        req.session.errorMessage = null;

                        res.render('event', { eventDetails: eventDetails });
                    }
                    else {
                        req.session.errorMessage = 'Error displaying comments';
                        res.render('event', { eventDetails: eventDetails });
                    }
                });
//                var detailsToPush = { eventId: eventDetails.event_id, eventTitle: eventDetails. };
        }
        else {
            req.session.errorMessage = err;
            res.redirect('/');
        }
    });
});


// =========== Create ===========

//Get the 'create event' form
router.get('/create', function(req, res, next) {
    var orgId = req.query.orgId;
    
    res.render('create-event', { orgId: orgId });
});

//Create the event
router.post('/create', function(req, res, next) {
    
    /*
        TODO:
        
        CHECK TO SEE IF REQUESTED DATE IS IN THE FUTURE
    */
    
    var orgId = req.body.orgId;
    var eventTitle = req.body.newEventTitle;
    var eventDesc = req.body.newEventDesc;
    var eventStartDate = req.body.newEventStartDate;
    var eventImagePath = req.files.eventImage ? req.files.eventImage.name : 'images/sample_group_avatar.png';
    var canUsersComment = req.body.canUsersComment ? true : false;
    var inputError = inputValidator.validateOrgAndEventInput([ eventTitle, eventDesc ]);
    
    if(!inputError) {
        events.addNewEvent(eventTitle, eventDesc, eventStartDate, orgId, canUsersComment, eventImagePath, function onAddNewEvent(err, result) {
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
    var canUsersComment = req.body.canUsersComment ? true : false;
    var eventImagePath = req.body.eventImage ? req.body.eventImage.name : 'images/sample_group_avatar.png';
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


//Post a comment
router.post(/(\d+)\/comment/, function(req, res, next) {
    var eventId = req.params[0];
    var userId = req.session.user.userId;
    
    comments.addComment(eventId, userId, req.body.comment, function(err, result) {
        if(!err && result) {
            res.redirect('/events/' + eventId);
        }
        else {
            req.session.errorMessage = err.message;
            res.redirect('/events/' + eventId);
        }
    });
});


// =========== Opt In / Opt Out of Event ===========

router.get(/(\d+)\/optin/ || /(\d+)\/optout/, function(req, res, next) {
    var userId = req.session.user.userId;
    var eventId = req.params[0];
    
    if(req.url.match('optin')) {
        attendees.changeAttendanceStatus(userId, eventId, true, function onAttendanceChange(err, result) {
            if(!err) {
                req.session.message = 'You are now attending this event';
                res.redirect('/events/' + eventId);
            }
            else {
                req.session.errorMessage = 'Something went wrong attending this event';
                res.redirect('/events/' + eventId);
            }
        });
    }
    else {
        attendees.changeAttendanceStatus(userId, eventId, false, function onAttendanceChange(err, result) {
            if(!err) {
                req.session.message = 'You are no longer attending this event';
                res.redirect('/events/' + eventId);
            }
            else {
                req.session.errorMessage = 'Something went wrong leaving this event';
                res.redirect('/events/' + eventId);
            }
        });
    }
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


module.exports = router;
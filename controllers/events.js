var express = require('express');
var router = express.Router();
var events = require('../models/event.js');
var commentModel = require('../models/comment.js');
var memberModel = require('../models/member.js');
var attendeeModel = require('../models/attendee.js');
var inputValidator = require('../models/input-validator.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();


// =========== Get All Events ===========

router.get('/', function(req, res, next) {
    events.getAllEvents(function(err, listOfEvents) {
        if(!err) {
            res.render('all-events', { user: req.session.user, listOfEvents: listOfEvents });
        }
        else {
            req.session.errorMessage = err;
            res.redirect('/');
        }
    });
});


// =========== View Event Details ===========

router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var eventId = req.params[0];
    
    events.getEventDetails(eventId, function(err, eventDetails) {
        if(!err && eventDetails) {
                commentModel.getComments(eventId, function(err, listOfComments) {
                    if(!err && listOfComments) {
                        eventDetails.listOfComments = listOfComments;
                        eventDetails.message = req.session.message;
                        eventDetails.errorMessage = req.session.errorMessage;
                        req.session.message = null;
                        req.session.errorMessage = null;

                        res.render('event', { user: req.session.user, eventDetails: eventDetails });
                    }
                    else {
                        req.session.errorMessage = 'Error displaying comments';
                        res.render('event', { user: req.session.user, eventDetails: eventDetails });
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
    
    res.render('create-event', { user: req.session.user, orgId: orgId });
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
                    res.render('create-event', { user: req.session.user, orgId: orgId, errorMessage: 'Event unsuccessfully created, try again later or contact the administrator' });
                }
            }
            else {
                res.render('create-event', { user: req.session.user, orgId: orgId });
            }
        });
    }
    else {
        req.session.errorMessage = inputError.message;
        res.render('create-event', { user: req.session.user, orgId: orgId });
    }
});


// =========== Edit ===========

//Get the 'edit event' form
router.get(/(\d+)\/edit/, function(req, res, next) {
    res.render('edit-event', { user: req.session.user, eventId: req.params[0] });
});

//Edit the event details
router.put(/(\d+)\/edit/, function(req, res, next) {
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
                    res.render('edit-event', { user: req.session.user, eventId: eventId, errorMessage: 'Event information not updated, something went wrong, please try again later' });
                }
            }
            else {
                res.render('edit-event', { user: req.session.user, eventId: eventId });
            }
        });
    }
    else {
        req.session.errorMessage = inputError.message;
        res.render('edit-event', { user: req.session.user, eventId: eventId });
    }
});


// =========== Comments ===========


//Post a comment
router.post(/(\d+)\/comment/, function(req, res, next) {
    var eventId = req.params[0];
    var userId = req.session.user.userId;
    
    commentModel.addComment(eventId, userId, req.body.comment, function(err, result) {
        if(!err && result) {
            res.redirect('/events/' + eventId);
        }
        else {
            eventEmitter.emit('specificEventError', req, res, err, eventId);
        }
    });
});


// =========== Opt In / Opt Out of Event ===========

router.get(/((\d+)\/optin)/ || /(\d+)\/optout/, function(req, res, next) {
    var userId = req.session.user.userId;
    var eventId = req.params[0];
    var isAttending = true;
    
    if(req.url.match('optout')) {
        isAttending = false;
    }

    attendeeModel.changeAttendanceStatus(userId, eventId, isAttending, function(err, result) {
        if(!err) {
            req.session.message = (isAttending ? 'You are now attending this event.' : 'You are no longer attending this event.');
            res.redirect('/events/' + eventId);
        }
        else {
            console.log('Error changing event attendance status');
            eventEmitter.emit('specificEventError', req, res, err);
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
//        memberModel.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
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
//        memberModel.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
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

eventEmitter.on('generalEventError', function(req, res, err) {
    req.session.errorMessage = err;
    res.redirect('/events');
});


eventEmitter.on('specificEventError', function(req, res, err, eventId) {
    req.session.errorMessage = err;
    res.redirect('/events/' + eventId);
});

eventEmitter.on('eventCreationError', function(req, res, err, completedFields) {
    res.redirect('/events/create');
});

eventEmitter.on('eventUpdateError', function(req, res, err, eventId) {

});


module.exports = router;
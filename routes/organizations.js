var express = require('express');
var router = express.Router();
var dbManager = require('../resources/js/db-manager.js');


// ======== GET ========

//Retrieve and display an organization and its basic information
//Old regex pattern for capturing just digit: (\d+)(?!\/.*)
router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    console.log('Captured URL: ' + req.url);
    var orgId = req.params[0];
    
    console.log("Organization to retrieve: " + orgId);
    
    dbManager.getOrganization(orgId, function(err, data) {
        console.log("Inside get organization query");
        if(!err) {
            var orgId = data.organization_id;
            var orgName = data.name;
            var orgDesc = data.description;
            
//            retrieveExtraDetails(orgId, function(err, data) {
//                
//            });
            
//            if(orgId === req.session.lastOrgVisited[orgId]) {
//                console.log('Found organization details in session, rendering organization page now');
//            }
//            else {
                console.log('Organization details not found inside session');
                //There's a better way but you're just not seeing it yet
                //Stop throwing errors, do something about it
                retrieveMembersOfOrg(orgId, function(err, members) {
                    if(!err) {
                        retrieveMemberDetails(members, function(err, memberDetails) {
                            if(!err) {
                                retrieveListOfEventDetails(orgId, function(err, eventDetails) {
                                    if(!err) {
        //                                req.session.eventDetails = eventDetails;
                                        req.session.lastOrgVisited = { orgId: orgId, orgName: orgName, orgDesc: orgDesc, memberDetails: memberDetails, eventDetails: eventDetails };
                                        res.render('organization', { orgId: orgId, orgName: orgName, orgDesc: orgDesc, members: memberDetails, events: eventDetails });
                                    }
                                    else {
                                        console.log(err);
    //                                    redirectError(err);
                                    }
                                });
                            }
                            else {
                                console.log(err);
    //                            redirectError(err);
                            }
                            //make a json object like req.session.organization1
    //                        req.session.organization1.push({ orgId: orgId, orgName: orgName, orgDesc: orgDesc, memberDetails: memberDetails });
    //                        req.session.memberDetails = memberDetails;
    //                        res.render('organization', { orgId: orgId, orgName: orgName, orgDesc: orgDesc, members: memberDetails });
                        });
                    }
                    else {
                        console.log(err);
    //                    redirectError(err);
                    }
                });
//            }
        }
        else {
            console.log(err);
            var err = new Error('Not Found');
            err.status = 404;
            res.render('error', { error: err });
        }
    });
});

//Edit organization form
router.get(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    
    dbManager.retrieveIsMemberAdmin(orgId, req.session.userId, function(isAdmin) {
        if(isAdmin) {
            res.render('edit_organization', { orgId: orgId });
        }
        else {
            res.render('organization', { orgId: orgId, message: 'You are not an admin of this organizaion' });
        }
    });
});

//Get an event's page with details
router.get(/\/(\d+)\/events\/(\d+)/, function(req, res, next) {
    var orgId = req.params[0];
    var requestedEventId = req.params[1];
//    var sessionEventDetails = req.session.lastOrgVisited.eventDetails;
    
    retrieveSingleEventDetails(requestedEventId, function(err, eventDetails) {
        retrieveComments(requestedEventId, function(err, listOfComments) {
            res.render('event', { eventId: requestedEventId, orgId: orgId, title: eventDetails.title, description: eventDetails.description, startDate: eventDetails.start_date, comments: listOfComments });
        });
        
    });
});

//Get event creation form
router.get(/(\d+)\/events\/create/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.userId;
    
    console.log('User ID: ' + userId);
    retrieveIsMemberAdmin(orgId, userId, function(isAdmin) {
        console.log('Is the member an admin? ' + isAdmin);
        if(isAdmin) {
            res.render('create_event', { orgId: orgId });
        }
        else {
            res.render('organization', { orgId: orgId, message: 'You are not an admin of this orgnaization' });
        }
    });
});

//Get organization creation form
router.get('/create', function(req, res, next) {
    res.render('create_organization');
});


// ======== POST ========

//Create new event
router.post(/(\d+)\/events\/create/, function(req, res, next) {
    var orgId = req.params[0];
    var eventTitle = dbManager.checkInvalidInput(req.body.newEventTitle);
    var eventDesc = dbManager.checkInvalidInput(req.body.newEventDesc);
    var startDate = req.body.startDate;
    
    retrieveIsMemberAdmin(orgId, req.session.userId, function(isAdmin) {
        console.log('Is the member an admin?' + isAdmin);
        if(isAdmin) {
            dbManager.addNewEvent(orgId, eventTitle, eventDesc, startDate, function(err) {
                if(!err) {
                    console.log('Success adding new event');
                    res.redirect('/organizations/' + orgId);
                }
                else {
                    console.log('Error adding new event');
                    throw err;
                }
            });
        }
        else {
            res.render('organization', { orgId: orgId, message: 'You are not an admin of this organization' });
        }
    });
});

//Update organization's info
router.post(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var newOrgName = dbManager.checkInvalidInput(req.body.newOrgName);
    var newOrgDesc = dbManager.checkInvalidInput(req.body.newOrgDesc);
    
    retrieveIsMemberAdmin(orgId, req.session.userId, function(isAdmin) {
        if(isAdmin) {
            dbManager.alterOrganizationInfo(orgId, newOrgName, newOrgDesc, function(err) {
                if(!err) {
                    console.log("Organization successfully updated");
                    res.render('organization', { orgId: orgId, message: 'Organization successfully updated' });
                }
                else {
                    res.render('organization', { orgId: orgId, errorMessage: 'Error updating organization, please try again' });
                }
            });
        }
        else {
            res.render('organization', { orgId: orgId, message: 'You are not an admin of this organization' });
        }
    });
});

//Create a new organization
router.post('/create', function(req, res, next) {
    try {
        var orgName = dbManager.checkInvalidInput(req.body.orgName);
        var orgDesc = dbManager.checkInvalidInput(req.body.orgDesc);

        //Add a new organization to the DB
        dbManager.addNewOrganization(orgName, orgDesc, function(err) {
            if(err) {
                res.render('create_organization', { errorMessage: err.message });
            }
            else {
                //Get the organization's ID and add the user as a member/admin to that organization
                dbManager.getOrgIDByName(orgName, function(err, orgId) {
                    if(!err) {
                        addNewMember(orgId, req.session.userId, true);
                        res.redirect('/organizations/' + orgId);
                    }
                });
            }
        });
    }
    catch(e) {
        res.render('create_organization', { errorMessage: e.message });
    }
});

router.post(/\/(\d+)\/events\/(\d+)\/comment/, function(req, res, next) {
    var eventId = req.params[1];
    var commentMessage = dbManager.checkInvalidInput(req.body.comment_message);
    
    dbManager.addNewComment(commentMessage, req.session.username, eventId, function(err) {
        if(!err) {
            res.redirect('/organizations/' + req.params[0] + '/events/' + eventId);
        }
    });
});


//Misc methods to get myself out of callback hell

var addNewMember = function(orgId, userId, isAdmin) {
    dbManager.addNewMemberToOrg(orgId, userId, isAdmin, function(err) {
        if(!err) {
            console.log("Success adding new member");
        }
        else {
            console.log("Error adding new member");
            console.log(err);
            throw err;
        }
    });
}

var retrieveMembersOfOrg = function(orgId, callback) {
    dbManager.retrieveMembersOfOrg(orgId, function(err, members) {
        callback(err, members);
    });
}

var retrieveIsMemberAdmin = function(orgId, memberId, callback) {
    dbManager.retrieveIsMemberAdmin(orgId, memberId, function(isAdmin) {
        callback(isAdmin);
    });
}

var retrieveUsernameByID = function(memberId, callback) {
    dbManager.retrieveUsernameByID(memberId, function(err, username) {
        callback(err, username);
    });
}

var retrieveMemberDetails = function(membersList, callback) {
    dbManager.retrieveAllUsers(function(err, userDetails) {
        if(!err) {
            var detailsToReturn = [];
            
            for(member in membersList) {
                for(var i = 0; i < userDetails.length; i++) {
                    if(membersList[member] && (userDetails[i].user_id === membersList[member].member_id)) {
                        detailsToReturn.push({ userId: userDetails[i].user_id, username: userDetails[i].username });
                    }
                }
            }
            
            callback(null, detailsToReturn); 
        }
        else {
            callback(err, null);
        }
    });
}

var retrieveListOfEventDetails = function(requestedOrgId, callback) {
    dbManager.retrieveAllEventsByOrgID(requestedOrgId, function(err, listOfEventDetails) {
        if(!err) {
            callback(null, listOfEventDetails);
        }
        else {
            throw err;
        }
    });
}

var retrieveSingleEventDetails = function(requestedEventId, callback) {
    dbManager.retrieveSingleEventDetails(requestedEventId, function(err, eventDetails) {
        if(!err) {
            callback(null, eventDetails);
        }
        else {
            throw err;
        }
    });
}

var retrieveComments = function(eventIdPostedTo, callback) {
    dbManager.retrieveAllCommentsWhere(eventIdPostedTo, function(err, listOfComments) {
        if(!err) {
            callback(null, listOfComments);
        }
        else {
            throw err;   
        }
    });
}

//var renderPage = function(viewName, params, message) {
//    var paramObject = {};
//    if(params) {
//        for(param in params) {
//            //Push into object
//        }
//    }
//}

////Implement this method for ease of use later?
//var renderPage = function(viewName, params, message) {
////    for every value in params, pass it to res.render
////    console.log("Organization #" + orgId);
////    console.log("Members: " + members);
////    res.render('organization', { orgId: orgId, orgName: orgName, orgDesc: orgDesc });
//    if(message) {
//        res.render(viewName, params, message);
//    }
//    else {
//        res.render(viewName, params);
//    }
////    res.render(, { 
//}

////If the session holds some events
//    if(sessionEventDetails) {
//        //For every event in the session's list of events
//        console.log('Session holds some event details, searching through details now');
//        for(event in sessionEventDetails) {
//            var sessionEventId = sessionEventDetails[event].event_id;
//            console.log('inside for in loop');
//            console.log('Session event ID: ' + sessionEventId);
//            console.log('Requested event ID: ' + requestedEventId);
//            if(sessionEventId === requestedEventId) {
//                console.log('found event in session');
//                var eventDetails = sessionEventDetails[event];
//                res.render('event', { title: eventDetails[eventId].title, description: eventDetails[eventId].description });
//            }
//        }
//    }
//    else {
//        getSingleEventDetails(requestedEventId, function(err, eventDetails) {
//            res.render('event', { event_id: requestedEventId, title: eventDetails.title, description: eventDetails.description, startDate: eventDetails.start_date });
//        });
//    }

module.exports = router;
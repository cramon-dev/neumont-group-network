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
                                retrieveEventDetails(orgId, function(err, eventDetails) {
                                    if(!err) {
        //                                req.session.eventDetails = eventDetails;
                                        console.log('Member details inside retrieveEventDetails: ' + memberDetails);
                                        req.session.lastOrgVisited = { orgId: orgId, orgName: orgName, orgDesc: orgDesc, memberDetails: memberDetails, eventDetails: eventDetails };
                                        console.log('Last org visited ID: ' + req.session.lastOrgVisited.orgId);
                                        console.log('Last org visited event details: ' + req.session.lastOrgVisited['eventDetails']);
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
    console.log('get event details');
    if(req.session.lastOrgVisited) {
        console.log('found stuff in session');
        var eventDetails = req.session.lastVisitedOrg['eventDetails'];
        res.render('event', { title: eventDetails.title, description: eventDetails.description });
    }
//    res.render('event', { title: title, description: desc });
//    res.render('event', { 
});

//Get event creation form
router.get(/(\d+)\/events\/create/, function(req, res, next) {
    res.render('create_event', { orgId: req.params[0] });
});

//Get organization creation form
router.get('/create', function(req, res, next) {
    res.render('create_organization');
});


// ======== POST ========

//Create new event
router.post(/(\d+)\/events\/create/, function(req, res, next) {
    var eventTitle = dbManager.checkInvalidInput(req.body.newEventTitle);
    var eventDesc = dbManager.checkInvalidInput(req.body.newEventDesc);
    var startDate = req.body.eventStartDate;
    
    dbManager.addNewEvent(req.params[0], eventTitle, eventDesc, startDate, function(err) {
        if(err) {
            throw err;
        }
        else {
            console.log("Success adding new event");
            res.redirect('/organizations/' + req.params[0]);
        }
    });
});

//Update organization's info
router.post(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var newOrgName = dbManager.checkInvalidInput(req.body.newOrgName);
    var newOrgDesc = dbManager.checkInvalidInput(req.body.newOrgDesc);
    
    dbManager.retrieveIsMemberAdmin(orgId, req.session.userId, function(isAdmin) {
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
    dbManager.retrieveIsMemberAdmin(orgId, memberId, function(err, isAdmin) {
        callback(err, isAdmin);
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

var retrieveEventDetails = function(requestedOrgId, callback) {
    dbManager.retrieveAllEventsByOrgID(requestedOrgId, function(err, eventDetails) {
        if(!err) {
            console.log('After retrieving all events by org ID');
            console.log('Event title: ' + eventDetails[0].title);
            console.log('Event description: ' + eventDetails[0].description);
            console.log('Event start date: ' + eventDetails[0].start_date);
            
            callback(null, eventDetails);
        }
        else {
            throw err;
        }
    });
}

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


module.exports = router;
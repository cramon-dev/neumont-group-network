var express = require('express');
var router = express.Router();
var dbManager = require('../resources/js/db-manager.js');

//Retrieve and display an organization and its basic information
router.get(/(\d+)(?!\/.*)/, function(req, res, next) {
    var orgId = req.params[0];
    
    dbManager.getOrganization(orgId, function(err, data) {
        if(!err) {
            var orgId = data.organization_id;
            var orgName = data.name;
            var orgDesc = data.description;
            
            retrieveMembersOfOrg(orgId, function(err, members) {
                if(!err) {
                    retrieveMemberDetails(members, function(err, memberDetails) {
                        //make a json object like req.session.organization1
                        req.session.memberDetails = memberDetails;
//                        res.render('organization', { orgId: orgId, orgName: orgName, orgDesc: orgDesc, members: memberDetails });
                    });
                }
                else {
                    throw err;
                }
            });
            
            retrieveEventDetails(orgId, function(err, eventDetails) {
                if(!err) {
                    req.session.eventDetails = eventDetails;
                    console.log('Member details inside retrieveEventDetails: ' + req.session.memberDetails);
                    res.render('organization', { orgId: orgId, orgName: orgName, orgDesc: orgDesc, members: req.session.memberDetails, events: eventDetails });
                }
                else {
                    throw err;
                }
            });
        }
        else {
            var err = new Error('Not Found');
            err.status = 404;
            res.render('error', { error: err });
        }
    });
});

//Get organization creation form
router.get('/create', function(req, res, next) {
    res.render('create_organization');
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
        var db_conn = dbManager.createConnectionToDB();

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

//Get event creation form
router.get(/(\d+)\/events\/create/, function(req, res, next) {
    res.render('create_event', { orgId: req.params[0] });
});

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
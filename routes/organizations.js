var express = require('express');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

//Retrieve and display an organization and its basic information
router.get(/(\d+)(?!\/.*)/, function(req, res, next) {
    var org_id = req.params[0];
//    var db_conn = db_manager.getConnection();
    var db_conn = db_manager.createConnectionToDB();

    db_manager.getOrganization(db_conn, org_id, function(err, org_id, org_name, org_desc) {
        if(!err) {
            retrieveMembersOfOrg(org_id, function(err, members) {
                if(!err) {
                    retrieveUserDetails(db_conn, members, function(err, member_details) {
                        req.session.member_details = member_details;
//                        res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc, members: member_details });
                    });
                }
                else {
                    throw err;
                }
            });
            
            retrieveEventDetails(org_id, function(err, event_details) {
                if(!err) {
                    req.session.event_details = event_details;
                    console.log("Event details: " + event_details);
                    res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc, members: req.session.member_details, events: event_details });
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
    var org_id = req.params[0];
    var db_conn = db_manager.createConnectionToDB();
    
    db_manager.retrieveIsMemberAdmin(db_conn, org_id, req.session.user_id, function(isAdmin) {
        if(isAdmin) {
            res.render('edit_organization', { org_id: org_id });
        }
        else {
            res.render('organization', { org_id: org_id, message: 'You are not an admin of this organizaion' });
        }
    });
});

//Update organization's info
router.post(/(\d+)\/edit/, function(req, res, next) {
    console.log(req.body.new_org_name);
    console.log(req.body.new_org_desc);
    //This is potentially a bad idea, consider refactoring this so that the user doesn't see the org's id?
    console.log(req.body.org_id);
    
    var db_conn = db_manager.createConnectionToDB();
    var org_id = req.params[0];
    var new_org_name = db_manager.checkInvalidInput(req.body.new_org_name);
    var new_org_desc = db_manager.checkInvalidInput(req.body.new_org_desc);
    
    db_manager.retrieveIsMemberAdmin(db_conn, org_id, req.session.user_id, function(isAdmin) {
        if(isAdmin) {
            db_manager.alterOrganizationInfo(db_conn, org_id, new_org_name, new_org_desc, function(err) {
                if(!err) {
                    console.log("Organization successfully updated");
                    res.render('organization', { org_id: org_id, message: 'Organization successfully updated' });
                }
                else {
                    res.render('organization', { org_id: org_id, error_message: 'Error updating organization, please try again' });
                }
            });
        }
        else {
            res.render('organization', { org_id: org_id, message: 'You are not an admin of this organization' });
        }
    });
});

//Create a new organization
router.post('/create', function(req, res, next) {
    try {
        var org_name = db_manager.checkInvalidInput(req.body.org_name);
        var org_desc = db_manager.checkInvalidInput(req.body.org_desc);
        var db_conn = db_manager.createConnectionToDB();

        //Add a new organization to the DB
        db_manager.addNewOrganization(db_conn, org_name, org_desc, function(err) {
            if(err) {
                res.render('create_organization', { error_message: err.message });
            }
            else {
                //Get the organization's ID and add the user as a member/admin to that organization
                db_manager.getOrgIDByName(db_conn, org_name, function(err, org_id) {
                    if(!err) {
                        addNewMember(db_conn, org_id, req.session.user_id, true);
                        res.redirect('/organizations/' + org_id);
                    }
                });
            }
        });
    }
    catch(e) {
        res.render('create_organization', { error_message: e.message });
    }
});

//Get event creation form
router.get(/(\d+)\/events\/create/, function(req, res, next) {
    res.render('create_event', { org_id: req.params[0] });
});

//Create new event
router.post(/(\d+)\/events\/create/, function(req, res, next) {
    var event_title = db_manager.checkInvalidInput(req.body.new_event_title);
    var event_desc = db_manager.checkInvalidInput(req.body.new_event_desc);
    var event_date = req.body.new_event_date;
    
    db_manager.addNewEvent(req.params[0], event_title, event_desc, event_date, function(err) {
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

var addNewMember = function(db_conn, org_id, user_id, isAdmin) {
    var is_admin = isAdmin ? 1 : 0;
    db_manager.addNewMemberToOrg(db_conn, org_id, user_id, is_admin, function(err) {
        if(!err) {
            console.log("Success adding new member");
        }
        else {
            console.log(err);
            throw err;
        }
    });
}

var retrieveMembersOfOrg = function(org_id, callback) {
    var db_conn = db_manager.createConnectionToDB();
    
    db_manager.retrieveMembersOfOrg(db_conn, org_id, function(err, members) {
        if(!err) {
            callback(null, members);
        }
        else {
            callback(err, null, null);
        }
    });
}

var retrieveUsernameByID = function(member_id, callback) {
    db_manager.retrieveUsernameByID(db_conn, member_id, function(err, username) {
        if(!err) {
            callback(null, username);
        }
        else {
            callback(err, null);
        }
    });
}

var retrieveUserDetails = function(db_conn, members_list, callback) {
    db_manager.retrieveAllUsers(db_conn, function(err, user_details) {
        if(!err) {
            var new_user_details = [];
            
            for(member in members_list) {
                for(var i = 0; i < user_details.length; i++) {
                    if(members_list[member] && (user_details[i].user_id === members_list[member].member_id)) {
                        new_user_details.push({ user_id: user_details[i].user_id, username: user_details[i].username });
                    }
                }
            }
            
            callback(null, new_user_details); 
        }
        else {
            callback(err, null);
        }
    });
}

var retrieveEventDetails = function(requested_org_id, callback) {
    db_manager.retrieveAllEventsByOrgID(requested_org_id, function(err, event_details) {
        if(!err) {
            callback(null, event_details);
        }
        else {
            throw err;
        }
    });
}

////Implement this method for ease of use later?
//var renderPage = function(view_name, params, message) {
////    for every value in params, pass it to res.render
////    console.log("Organization #" + org_id);
////    console.log("Members: " + members);
////    res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc });
//    if(message) {
//        res.render(view_name, params, message);
//    }
//    else {
//        res.render(view_name, params);
//    }
////    res.render(, { 
//}


module.exports = router;
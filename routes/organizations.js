var express = require('express');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

//Retrieve and display an organization and its basic information
router.get(/(\d+)(?!\/.*)/, function(req, res, next) {
    var org_id = req.params[0];
    var db_conn = db_manager.createConnectionToDB();

    db_manager.getOrganization(db_conn, org_id, function(err, org_id, org_name, org_desc) {
        if(!err) {
            //In here, implement a feature later that stores the results of this query so that there's less load on the db
            //Use the organization's id to get a list of members somewhere in here before we render
//            var org_details = { org_id: org_id, org_name: org_name, org_desc: org_desc };
            retrieveMembersOfOrg(org_id, function(err, members) {
                if(!err) {
                    retrieveUserDetails(db_conn, members, function(err, member_details) {
                        //These two lines of code work if async doesn't work atm, just comment out the method above
                        console.log("Right before we render the page, member_details:  " + member_details);
                        console.log("Right before we render the page, member username " + member_details[0].username);
                        req.session.member_details = member_details;
//                        console.log("Right before we render the page, members = " + members);
                        res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc, members: member_details });
//                        res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc, members: members });
                    });
//                    retrieveUserDetails(db_conn, members, function(err, member_details) {
//                        if(err) {
//                            console.log(err);
//                        }
//                        else {
//                            res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc, members: member_details });
//                        }
//                    });
//                    for(var i = 0; i < members.length; i++) {
//                        db_manager.retrieveUsernameByID(db_conn, members[i].member_id, function(err, username) {
//                            if(err) {
//                                throw err;
//                            }
//                            else {
//                                member_details.push({ member_id: members[i].member_id, username: username });
//                            }
//                        });
//                    }
//                    res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc, members: members });
                }
                else {
                    console.log(err);
                }
            });
//            retrieveMembersOfOrg(req, res, org_details, renderPage);
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
        console.log("Is user an admin: " + isAdmin);
        if(isAdmin) {
            db_manager.alterOrganizationInfo(db_conn, org_id, new_org_name, new_org_desc, function(err) {
                if(!err) {
                    console.log("Organization successfully updated");
                    res.render('organization', { org_id: org_id, members: req.session.member_details, message: 'Organization successfully updated' });
                }
                else {
                    res.render('organization', { org_id: org_id, error_message: 'Error updating organization, please try again' });
                }
            });
        }
        else {
            res.render('organization', { org_id: org_id, members: req.session.member_details, message: 'You are not an admin of this organization' });
        }
    });
});

//Create a new organization
router.post('/create', function(req, res, next) {
    try {
        //Thinking I should generate an ID for the organization created so that I can add a new member without
        var org_name = db_manager.checkInvalidInput(req.body.org_name);
        var org_desc = db_manager.checkInvalidInput(req.body.org_desc);

        var db_conn = db_manager.createConnectionToDB();

        //After we add a new organization, then add the current member as an admin to that organization
        //Refactor this callback hell later
        db_manager.addNewOrganization(db_conn, org_name, org_desc, function(err) {
            if(!err) {
                res.render('organization', { org_name: org_name, org_desc: org_desc });
            }
            else {
                res.render('create_organization', { error_message: err.message });
            }
        });

        db_manager.getOrgIDByName(db_conn, org_name, function(err, org_id) {
            if(!err) {
                console.log("org_id: " + org_id);
                addNewMember(db_conn, org_id, req.session.user_id, true);
            }
        });
    }
    catch(e) {
        res.render('create_organization', { error_message: e.message });
    }
});

var addNewMember = function(db_conn, org_id, user_id, isAdmin) {
    var is_admin = isAdmin ? 1 : 0;
    db_manager.addNewMemberToOrg(db_conn, org_id, user_id, is_admin, function(err) {
        if(!err) {
            console.log("Success adding new member");
        }
        else {
            throw err;
        }
    });
}

var retrieveMembersOfOrg = function(org_id, callback) {
    var db_conn = db_manager.createConnectionToDB();
    
    db_manager.retrieveMembersOfOrg(db_conn, org_id, function(err, members) {
        if(err) {
            callback(err, null, null);
        }
        else {
            callback(null, members);
//            console.log("Members object before foreach loop: " + members);
//            var member_details = [];
//            for(var member_index = 0; member_index < members.length; member_index++) {
////                console.log("Inside member foreach loop: " + member);
//                console.log("Member ID inside foreach loop: " + members[member_index].member_id);
//                db_manager.retrieveUsernameByID(db_conn, members[member_index].member_id, function(err, username) {
//                    console.log("Username inside for loop: " + username);
//                    member_details.push({ member_id: members[member_index].member_id, username: username });
//                    if(member_details.length == members.length) {
//                        console.log("Member details: " + member_details);
//                        callback(null, member_details);
//                    }
//                });
//            }
//            callback('organization', { org_id: org_id, org_name: org_details[org_name], org_desc: org_details[org_desc], members: members });
        }
    });
}

var retrieveUsernameByID = function(member_id, callback) {
    db_manager.retrieveUsernameByID(db_conn, member_id, function(err, username) {
        if(err) {
            callback(err, null);
        }
        else {
            callback(null, username);
        }
    });
}

var retrieveUserDetails = function(db_conn, members_list, callback) {
    db_manager.retrieveAllUsers(db_conn, function(err, user_details) {
        if(err) {
            console.log(err);
        }
        else {
            var new_user_details = [];
            var counter = 0;
//            for(var i = 0; i < user_details.length; i++) {
//                if(user_details[i].user_id === members_list[i].member_id) {
//                    console.log("Found a match inside for loop, pushing to array");
//                    new_user_details.push({ user_id: user_details[i].user_id, username: user_details[i].username });
//                    console.log(new_user_details[i]);
//                }
//            }
            for(member in members_list) {
                //nested for loop soon..?
                console.log("Analyzing member " + members_list[member].member_id);
                console.log("Analyzing user " + user_details[counter].user_id);
                if(user_details[counter].user_id === members_list[member].member_id) {
                    console.log("Found a match inside for loop, pushing to array");
                    console.log("Adding user " + user_details[counter].username + " to array");
                    new_user_details.push({ user_id: user_details[counter].user_id, username: user_details[counter].username });
                    console.log(new_user_details[counter]);
                    counter++;
                }
            }
            callback(null, new_user_details);   
        }
    });
}

////Implement this method for ease of use later
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
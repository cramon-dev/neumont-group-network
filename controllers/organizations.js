var express = require('express');
var router = express.Router();
var util = require('util');
var q = require('q');
var organizations = require('../models/organization.js');
var members = require('../models/member.js');
var events = require('../models/event.js');
var inputValidator = require('../models/input-validator.js');

// =========== View All Organizations ===========

//router.get(/^\/?$/, function(req, res, next) {
//    organizations.getAllOrganizations(function onRetrieveOrgs(err, listOfOrgs) {
//        res.render('all-orgs', { title: 'Organizations', listOfOrgs: listOfOrgs });
//    });
//});

router.get(/^\/?$/, function(req, res, next) {
    organizations.getAllOrganizations(function onRetrieveOrgs(err, listOfOrgs) {
        res.json(listOfOrgs);
    });
});

// =========== View/Join Organization ===========

//Retrieve an organization and display their information
router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var orgId = req.params[0];
    
//    q.fcall(organizations.getOrganization(orgId))
//    .then(members.getOrgMemberDetails(orgId))
//    .then(events.getListOfEvents(orgId))
//    .then(function(err, data) {
//        console.log('got everything');
//    })
//    .catch(function (err) {
//        console.log('got an error');
//        console.log(util.inspect(err));
//    })
//    .done();
    
//    //Goddamn son. How did you let it get this bad. How the mighty have fallen.
//    organizations.getOrganization(orgId, function onOrgRetrieval(err, orgData) {
//        if(!err) {
//            if(orgData) {
//                members.getOrgMemberDetails(orgId, function onMemberDetailsRetrieval(err, listOfMemberDetails) {
//                    if(!err) {
//                        events.getListOfEvents(orgId, function onListOfEventsRetrieval(err, listOfEvents) {
//                            if(!err && listOfEvents) {
//                                orgData.listOfEvents = listOfEvents;
//                                orgData.listOfUsers = listOfMemberDetails;
//                                orgData.errorMessage = req.session.errorMessage;
//                                orgData.message = req.session.message;
//                                req.session.errorMessage = null;
//                                req.session.message = null;
//
//                                console.log(util.inspect(listOfMemberDetails));
//                                res.render('organization', orgData);
//                            }
//                            else {
//                                orgData.errorMessage = 'Something went wrong displaying a list of events';
//                                res.render('organization', orgData);
//                            }
//                        });
//                    }
//                    else {
//                        req.session.errorMessage = err.message;
//                        res.redirect('/');
//                    }
//                });
//            }
//            else {
//                var err = new Error('Not Found');
//                err.status = 404;
//                next();
//            }
//        }
//        else {
//            req.session.errorMessage = 'Something went wrong displaying that organization, please try again later';
//            res.redirect('/');
//        }
//    });
});

//Join an organization
router.get(/(\d+)\/join/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    members.isMemberOfOrg(orgId, userId, function(err, result) {
        if(!err && !result) {
            members.addNewOrgMember(orgId, userId, false, function(err, result) {
                req.session.message = 'You are now a member of this organization';
                res.redirect('/organizations/' + orgId);
            });
        }
        else {
            req.session.errorMessage = 'You are already a member of this organization';
            res.redirect('/organizations/' + orgId);
        }
    });
});

//Join an organization
router.get(/(\d+)\/leave/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    members.isMemberOfOrg(orgId, userId, function(err, result) {
        if(!err && !result) {
            members.removeOrgMember(orgId, userId, function(err, result) {
                req.session.message = 'You are no longer a member of this organization';
                res.redirect('/organizations/' + orgId);
            });
        }
        else {
            req.session.errorMessage = 'You aren\'t a member of this organization';
            res.redirect('/organizations/' + orgId);
        }
    });
});


// =========== Create ===========

//Retrieve the 'create organization' form
router.get('/create', function(req, res, next) {
    res.render('create-org');
});

//Create a new organization
router.post('/create', function(req, res, next) {
    var orgName = req.body.orgName;
    var orgDesc = req.body.orgDesc;
    var orgImagePath = req.files.orgImage ? req.files.orgImage.name : 'images/sample_group_avatar.png';
    var userId = req.session.user.userId;
    var inputs = [ orgName, orgDesc ];
    var inputError = inputValidator.validateOrgAndEventInput(inputs);

    if(!inputError) {
        organizations.addNewOrganization(orgName, orgDesc, userId, orgImagePath, function onOrgInsert(err, result) {
            if(!err) {
                var orgId = result;
                var userId = req.session.user.userId;

                //Insert 'true' because the organization must have an admin
                members.addNewOrgMember(orgId, userId, true, function onMemberInsert(err, result) {
                    console.log('Redirecting to new organization\'s page');
                    res.redirect('/organizations/' + orgId);
                });
            }
            else {
                res.render('create-org', { errorMessage: err.message });
            }
        });
    }
    else {
        res.render('create-org', { errorMessage: inputError.message });
    }
});


// =========== Edit ===========

//Check if the current user is an admin
router.all(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    //If no errors and they are an admin, send them to the proper route they requested
    //Otherwise, kick them back to organization's home page
    members.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
        if(!err) {
            if(result) {
                next();
            }
            else {
                req.session.errorMessage = 'You are not an admin of this organization';
                res.redirect('/organizations/' + orgId);
            }
        }
        else {
            req.session.errorMessage = 'Something went wrong, please try again';
            res.redirect('/organizations/' + orgId);
        }
    });
});

//Retrieve the 'edit organization' form
router.get(/(\d+)\/edit/, function(req, res, next) {
    //Is passing the ID really necessary?
    res.render('edit-org', { orgId: req.params[0] });
});


//Update organization's info
router.post(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    var newOrgName = req.body.newOrgName;
    var newOrgDesc = req.body.newOrgDesc;
    var inputError = inputValidator.validateOrgAndEventInput([ newOrgName, newOrgDesc ]);
    
    if(!inputError) {
        organizations.editOrganization(orgId, newOrgName, newOrgDesc, function onEditOrg(err, result) {
            if(!err) {
                req.session.message = 'Organization successfully updated';
                res.redirect('/organizations/' + orgId);
            }
            else {
                req.session.errorMessage = 'Error updating organization, please try again';
                res.redirect('/organizations/' + orgId);
            }
        });
    }
    else {
        res.render('edit-org', { orgId: orgId, errorMessage: inputError.message });
    }
});


// =========== Helper Functions ===========

//How can I improve/implement this?
var getCurrentUserAdminStatus = function(orgId, userId, callback) {
    members.getIsMemberAdmin(orgId, userId, function onIsUserAdminRetrieval(err, isUserAdmin) {
        callback(err, isUserAdmin);
    });
}



module.exports = router;
var express = require('express');
var router = express.Router();
var organizationModel = require('../models/organization.js');
var memberModel = require('../models/member.js');
var userModel = require('../models/user.js');
var eventModel = require('../models/event.js');
var inputValidator = require('../models/input-validator.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();


// =========== Event Emitter ===========

eventEmitter.on('generalOrgError', function(req, res, err) {
    res.render('all-organizations', { user: req.session.user, errorMessage: err });
});

eventEmitter.on('specificOrgError', function(req, res, err) {
    req.session.errorMessage = err;
    res.redirect('/');
});

eventEmitter.on('renderOrgMinimalData', function(req, res, data, err) {
    req.session.errorMessage = err;
    res.render('organization', { user: req.session.user, orgData: data, errorMessage: err });
});


// =========== View/Join Organization ===========

router.get('/', function(req, res, next) {
    organizationModel.getAllOrganizations(function onOrgsRetrieval(err, listOfOrgs) {
        if(!err && listOfOrgs) {
            res.render('all-organizations', { user: req.session.user, listOfOrgs: listOfOrgs });
        }
        else {
            if(err) {
                req.session.errorMessage = err;
                res.redirect('/');
            }
            else {
                res.render('all-organizations', { user: req.session.user, listOfOrgs: [] });
            }
        }
    });
});

//Retrieve an organization and display their information
router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var orgId = req.params[0];
    
    //Goddamn son. How did you let it get this bad.
    organizationModel.getOrganization(orgId, function onOrgRetrieval(err, orgData) {
        if(!err) {
            if(orgData) {
                memberModel.getOrgMemberDetails(orgId, function onMemberDetailsRetrieval(err, listOfMemberDetails) {
                    if(!err && listOfMemberDetails) {
                        eventModel.getListOfEvents(orgId, function onListOfEventsRetrieval(err, listOfEvents) {
                            if(!err && listOfEvents) {
                                orgData.listOfEvents = listOfEvents;
                                orgData.listOfMembers = listOfMemberDetails;
                                // orgData.errorMessage = req.session.errorMessage;
                                // orgData.message = req.session.message;
                                req.session.errorMessage = null;
                                req.session.message = null;

                                res.render('organization', { user: req.session.user, orgData: orgData });
                            }
                            else {
                                eventEmitter.emit('renderOrgMinimalData', req, res, orgData, 'Something went wrong getting a list of events.');
                                // res.render('organization', { user: req.session.user , orgData: orgData });
                            }
                        });
                    }
                    else {
                        eventEmitter.emit('renderOrgMinimalData', req, res, orgData, 'Something went wrong getting a list of members.');
                        // req.session.errorMessage = err.message;
                        // res.redirect('/');
                    }
                });
            }
            else {
                eventEmitter.emit('specificOrgError', req, res, 'The organization you\'re looking for does not exist.');
                // req.session.errorMessage = 'The organization you\'re looking for does not exist.';
                // res.redirect('/');
            }
        }
        else {
            eventEmitter.emit('specificOrgError', req, res, 'Something went wrong displaying that organization, please try again later.');
            // req.session.errorMessage = 'Something went wrong displaying that organization, please try again later.';
            // res.redirect('/');
        }
    });
});

//Join an organization
router.get(/(\d+)\/join/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    memberModel.isMemberOfOrg(orgId, userId, function(err, result) {
        if(!err && !result) {
            memberModel.addNewOrgMember(orgId, userId, false, function(err, result) {
                req.session.message = 'You are now a member of this organization.';
                res.redirect('/organizations/' + orgId);
            });
        }
        else {
            req.session.errorMessage = 'You are already a member of this organization.';
            res.redirect('/organizations/' + orgId);
        }
    });
});

//Join an organization
router.get(/(\d+)\/leave/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    memberModel.isMemberOfOrg(orgId, userId, function(err, result) {
        if(!err && !result) {
            memberModel.removeOrgMember(orgId, userId, function(err, result) {
                req.session.message = 'You are no longer a member of this organization,';
                res.redirect('/organizations/' + orgId);
            });
        }
        else {
            req.session.errorMessage = 'You weren\'t a member of this organization to begin with.';
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
    var orgImagePath = '/resources/img/default_group_avatar.png';
    if(req.files.orgImage) {
        console.log('User provided another image');
        orgImagePath = req.files.orgImage.name;
    }
    var userId = req.session.user.userId;
    var inputs = [ orgName, orgDesc ];
    var inputError = inputValidator.validateOrgAndEventInput(inputs);
    console.log('Org Image Name: ' + orgImagePath);

    // if(!inputError) {
        organizationModel.addNewOrganization(orgName, orgDesc, userId, orgImagePath, function onOrgInsert(err, result) {
            if(!err) {
                var orgId = result;
                var userId = req.session.user.userId;

                //Insert 'true' because the organization must have an admin
                memberModel.addNewOrgMember(orgId, userId, true, function onMemberInsert(err, result) {
                    console.log('Redirecting to new organization\'s page');
                    res.redirect('/organizations/' + orgId);
                });
            }
            else {
                res.render('create-org', { errorMessage: err.message });
            }
        });
    // }
    // else {
    //     res.render('create-org', { errorMessage: inputError.message });
    // }
});


// =========== Edit ===========

//Check if the current user is an admin
router.all(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    //If no errors and they are an admin, send them to the proper route they requested
    //Otherwise, kick them back to organization's home page
    memberModel.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
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
router.put(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    var newOrgName = req.body.newOrgName;
    var newOrgDesc = req.body.newOrgDesc;
    var inputError = inputValidator.validateOrgAndEventInput([ newOrgName, newOrgDesc ]);
    
    if(!inputError) {
        organizationModel.editOrganization(orgId, newOrgName, newOrgDesc, function onEditOrg(err, result) {
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
    memberModel.getIsMemberAdmin(orgId, userId, function onIsUserAdminRetrieval(err, isUserAdmin) {
        callback(err, isUserAdmin);
    });
}

eventEmitter.on('orgCreateError', function(req, res, err) {

});

module.exports = router;
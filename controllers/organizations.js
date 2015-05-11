var express = require('express');
var router = express.Router();
var organization = require('../models/organization.js');
var members = require('../models/member.js');
var users = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');


// =========== View Organization ===========

//Retrieve an organization and display their information
router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var orgId = req.params[0];
    
    organization.getOrganization(orgId, function onOrgRetrieval(err, orgData) {
        if(!err) {
            if(orgData) {
                members.getOrgMembers(orgId, function onMembersRetrieval(err, listOfMembers) {
                    if(!err) {
                        //Somehow get a list of users to display on the organization's home page
//                        users.getUserDetails(listOfMemberIDs
                        if(req.session.errorMessage) {
                            orgData.errorMessage = req.session.errorMessage;
                            req.session.errorMessage = null;
                        }
                        
                        orgData.listOfMembers = listOfMembers;
                        res.render('organization', orgData);
                    }
                    else {
                        res.render('home', { errorMessage: err.message });
                    }
                });
            }
            else {
                var err = new Error('Not Found');
                err.status = 404;
                next();
            }
        }
        else {
//            res.locals.errorMessage = 'Something went wrong displaying that organization, please try again';
//            res.redirect('/');
            res.render('home', { errorMessage: 'Something went wrong displaying that organization, please try again' });
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
    var inputs = [ orgName, orgDesc ];
    var inputError = inputValidator.validateOrganizationInput(inputs);

    if(!inputError) {
        organization.addNewOrganization(orgName, orgDesc, function onOrgInsert(err, result) {
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

router.all(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.userId;
    
    members.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
        if(!err) {
            if(result) {
                console.log('Member is an admin, sending them to their proper route');
                next();
            }
            else {
                //Somehow set an error message saying they're not an admin
                console.log('Inside catch all edit routes, member is not an admin');
                req.session.errorMessage = 'You are not an admin of this organization';
                res.redirect('/organizations/' + orgId);
            }
        }
        else {
            //Somehow set an error message saying something went wrong, try again
            req.session.errorMessage = 'Something went wrong, please try again';
            res.redirect('/organizations/' + orgId);
        }
    });
});

//Retrieve the 'edit organization' form
router.get(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.user.userId;
    
    console.log('Inside get edit org form');
    members.getIsMemberAdmin(orgId, userId, function onRetrieveAdminStatus(err, result) {
        if(!err) {
            if(result) {
                res.render('edit-org');
            }
            else {
                //Somehow set an error message saying they're not an admin
                req.session.errorMessage = 'You are not an admin of this organization';
                res.redirect('/organizations/' + orgId);
            }
        }
        else {
            //Somehow set an error message saying something went wrong, try again
            req.session.errorMessage = 'Something went wrong, please try again';
            res.redirect('/organizations/' + orgId);
        }
    });
});


//Update organization's info
router.post(/(\d+)\/edit/, function(req, res, next) {
    var orgId = req.params[0];
    var userId = req.session.userId;
    var newOrgName = req.body.newOrgName;
    var newOrgDesc = req.body.newOrgDesc;
    var inputError = inputValidator.validateOrganizationInput([ newOrgName, newOrgDesc ]);
    
    if(!inputError) {
        members.getIsMemberAdmin(orgId, req.session.userId, function(err, isAdmin) {
            if(!err) {
                if(isAdmin) {
                    organization.editOrganization(orgId, newOrgName, newOrgDesc, function(err, result) {
                        if(!err) {
                            req.session.message = 'Organization successfully updated';
                            res.redirect('/organization/' + orgId);
                        }
                        else {
                            req.session.errorMessage = 'Error updating organization, please try again';
                            res.redirect('/organization/' + orgId);
                        }
                    });
                }
                else {
                    req.session.errorMessage = 'You are not an admin of this organization';
                    res.redirect('/organization/' + orgId);
                }
            }
            else {
                res.render('edit-org', { orgId: orgId, errorMessage: inputError.message });
            }
        });
    }
    else {
        res.render('edit-org', { orgId: orgId, errorMessage: inputError.message });
    }
});




module.exports = router;
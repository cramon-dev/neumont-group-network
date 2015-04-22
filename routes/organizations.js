var express = require('express');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

//Get an organization
router.get(/(\d+)/, function(req, res, next) {
//    checkIfUserIsLoggedIn(req, res);
    console.log("GET ORGANIZATION #: " + req.params[0]);
    var db_conn = db_manager.createConnectionToDB();

    db_manager.getOrganization(db_conn, req.params[0], function(err, org_id, org_name, org_desc) {
        if(!err) {
            //Use the organization's id to get a list of members somewhere in here before we render
            res.render('organization', { org_id: org_id, org_name: org_name, org_desc: org_desc });
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
//    checkIfUserIsLoggedIn(req, res);
    res.render('create_organization');
});

//Edit organization form
router.get(/(\d+)\/edit/, function(req, res, next) {
//    checkIfUserIsLoggedIn(req, res);
    res.render('edit_organization', { org_id: req.params[0] });
});

//Update organization's info
router.post(/(\d+)\/edit/, function(req, res, next) {
//    checkIfUserIsLoggedIn(req, res);
    console.log(req.params[0]);
//    throw {
//        name: "NotImplementedException",
//        message: "This method isn't implemented yet, but will be in the near future"
//    }
//    res.render('organization', { message: 'Details successfully changed' });
});

//Create a new organization
router.post('/create', function(req, res, next) {
//    checkIfUserIsLoggedIn(req, res);
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

//var checkIfUserIsLoggedIn = function(req, res) {
//    if(!req.session.username) {
//        res.redirect('/', { message: 'You need to be logged in to do that' });
//    }
//}

module.exports = router;
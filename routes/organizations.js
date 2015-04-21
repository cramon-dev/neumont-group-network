var express = require('express');
var router = express.Router();
var db_manager = require('../resources/js/db_manager.js');

//Get an organization
router.get(/(\d+)/, function(req, res, next) {
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
    res.render('create_organization');
});

//Update organization based on id
router.post(/(\d+)/, function(req, res, next) {
    throw {
        name: "NotImplementedException",
        message: "This method isn't implemented yet, but will be in the near future"
    }
//    res.render('organization', { message: 'Details successfully changed' });
});

//Create a new organization
router.post('/create', function(req, res, next) {
    try {
        var org_name = db_manager.checkInvalidInput(req.body.org_name);
        var org_desc = db_manager.checkInvalidInput(req.body.org_desc);
        
        var db_conn = db_manager.createConnectionToDB();
        
        //Refactor this callback hell later
        db_manager.addNewOrganization(db_conn, org_name, org_desc, function(err) {
            if(!err) {
                res.render('organization', { org_name: org_name, org_desc: org_desc });
            }
            else {
                res.render('create_organization', { error_message: err.message });
            }
        });
    }
    catch(e) {
        res.render('create_organization', { error_message: e.message });
    }
});

var addNewMember = function(db_conn, user_id, org_id, isAdmin) {
    
}

module.exports = router;
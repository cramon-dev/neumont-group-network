var express = require('express');
var router = express.Router();

//Get
router.get(/(\d+)/, function(req, res, next) {
    db_manager.getOrganization(req.params[0], function(err, org_id, org_name, org_desc, org_author_id) {
        if(!err) {
            //Use the organization's id to get a list of members
            res.render('organization', { org_name: org_name, org_desc: org_desc, org_author_id: org_author_id });
        }
        else {
            var err = new Error('Not Found');
            err.status = 404;
            res.render('error', { error: err });
        }
    });
});

router.get('/create', function(req, res, next) {
    res.render('create_organization');
});

//Create/Update
router.post(/(\d+)/, function(req, res, next) {
    throw {
        name: "NotImplementedException",
        message: "This method isn't implemented yet, but will be in the near future"
    }
//    res.render('organization', { message: 'Details successfully changed' });
});

router.post('/create', function(req, res, next) {
    try {
        var org_name = db_manager.checkInvalidInput(req.body.org_name);
        var org_desc = db_manager.checkInvalidInput(req.body.org_desc);
        
        var db_conn = db_manager.createConnectionToDB();
        
        db_manager.addNewOrganization(db_conn, org_name, org_desc, original_author_id, function(err) {
            if(!err) {
                res.render('organization', { org_name: org_name, org_desc: org_desc });
            }
            else {
                res.render('create_organization', { error_message: e.message });
            }
        });
    }
    catch(e) {
        res.render('create_organization', { error_message: e.message });
    }
});

module.exports = router;
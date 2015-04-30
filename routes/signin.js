var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db_manager = require('../resources/js/db_manager.js');

/* POST credentials */
//Is this adhering to REST? How can I better authenticate a user and make sure their credentials are safe?
router.post('/', function(req, res, next) {
    var username = db_manager.checkInvalidInput(req.body.username);
    var password = db_manager.checkInvalidInput(req.body.password);

    var db_conn = db_manager.createConnectionToDB();
    db_manager.signIn(db_conn, username, function(err, stored_hash, user_id) {
        if(err) {
            res.render('index', { message: e.message });
        }
        else {
            if(bcrypt.compareSync(password, stored_hash)) {
                req.session.user_id = user_id;
                req.session.username = username;
                if(req.session.last_action) {
                    console.log("Redirecting user to last page requested..");
                    res.redirect(req.session.last_action);
                }
                else {
                    res.render('home', { user_id: req.session.user_id, username: req.session.username });
                }
            }
            else {
                res.render('index', { message: 'Invalid username or password, try again' });
            }
        }
    });
});

module.exports = router;
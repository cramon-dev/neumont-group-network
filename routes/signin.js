var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db_manager = require('../resources/js/db_manager.js');

var password;

/* GET sign in page. */
//I know this isn't exactly adhering to REST, but I'm just trying this out
router.post('/', function(req, res, next) {
    try {
        var username = db_manager.checkInvalidInput(req.body.username);
        password = db_manager.checkInvalidInput(req.body.password);
        
        var db_conn = db_manager.createConnectionToDB();
        if(db_manager.signIn(db_conn, username, compareHashes)) {
            res.render('home', { username: username } ); //render home page with their username to show they're logged in
        }
        else {
            res.render('index', { message: 'Invalid password, try again' });
        }
    }
    catch(e) {
        res.render('index', { message: e.message });
    }
});

var compareHashes = function(err, stored_hash) {
    if(err) {
        console.log(err);
    }
    else {
//        console.log("Do passwords match? " + bcrypt.compareSync(password, stored_hash));
        return bcrypt.compareSync(password, stored_hash);
    }
}

module.exports = router;
module.exports.compareHashes = compareHashes;
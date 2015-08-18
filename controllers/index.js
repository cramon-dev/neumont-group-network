var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.user) {
        var message = req.session.message;
        var errorMessage = req.session.errorMessage;
        req.session.message = null;
        req.session.errorMessage = null;
        
        // res.render('home', { userId: req.session.user.userId, username: req.session.user.username, 
        //                     userAvatar: req.session.user.userAvatar, message: message, errorMessage: errorMessage });
        res.render('home', { user: req.session.user, message: message, errorMessage: errorMessage });
    }
    else {
        res.render('index');
    }
});

module.exports = router;
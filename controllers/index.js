var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.user) {
        res.render('home', { userId: req.session.user.userId, username: req.session.user.username });
    }
    else {
        res.render('index');
    }
});

module.exports = router;
var express = require('express');
var router = express.Router();

router.get('/signout', function(req, res, next) {
    //Insert code later to log user out..
    res.render('home', { message: 'Successfully logged out. See you soon!' });
});

module.exports = router;
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //Insert code later to log user out..
    res.render('index', { message: 'Successfully logged out. See you soon!' });
});

module.exports = router;
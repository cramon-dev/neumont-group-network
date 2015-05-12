var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.destroy(function(err) {
        if(!err) {
            res.render('index', { message: req.session.message });
        }
        else {
            throw err;
        }
    });
});

module.exports = router;
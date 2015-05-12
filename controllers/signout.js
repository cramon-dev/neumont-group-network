var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.destroy(function(err) {
        if(!err) {
            if(req.session.message) {
                res.render('index', { message: req.session.message });
            }
            else {
                res.render('index', { message: 'Successfully signed out, see you soon!' });
            }
        }
        else {
            throw err;
        }
    });
});

module.exports = router;
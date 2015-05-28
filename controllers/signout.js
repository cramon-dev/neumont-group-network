var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var message = req.session.message;
    
    req.session.destroy(function(err) {
        if(!err) {
            if(message) {
                res.render('index', { message: message });
            }
            else {
                res.redirect('/');
//                res.render('index', { message: 'Successfully signed out, see you soon!' });
            }
        }
        else {
            throw err;
        }
    });
});

module.exports = router;
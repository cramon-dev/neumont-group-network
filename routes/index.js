var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
//    if(req.session.username) {
//        res.render('home', { username: req.session.username });
//    }
//    else {
        res.render('index', { title: 'Neumont Group Network' });
//    }
});

module.exports = router;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
//    if(req.session_state.username) {
//        res.render('home', { username: req.session_state.username });
//    }
//    else {
        res.render('index', { title: 'Neumont Group Network' });
//    }
});

module.exports = router;
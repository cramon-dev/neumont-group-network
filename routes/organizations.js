var express = require('express');
var router = express.Router();

//Get
router.get('/club', function(req, res, next) {
    res.render('organization', { title: 'Club Name' });
});

router.get('/order', function(req, res, next) {
    res.render('organization', { title: 'Order Name' });
});


//Create/Update
router.post('/club', function(req, res, next) {
    res.render('organization', { message: 'Details successfully changed' });
});

router.post('/order', function(req, res, next) {
    res.render('organization', { message: 'Details succesfully changed' });
});

module.exports = router;
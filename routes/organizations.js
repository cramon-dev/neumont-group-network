var express = require('express');
var router = express.Router();

//Get
router.get('/club', function(req, res, next) {
    res.render('organization', { title: 'Club Name' });
});

router.get('/order', function(req, res, next) {
    res.render('organization', { title: 'Order Name' });
});


//Update
router.post('/club', function(req, res, next) {
    res.render('organization', { message: 'Details successfully changed' });
});

router.post('/order', function(req, res, next) {
    res.render('organization', { message: 'Details succesfully changed' });
});


//Create
router.put('/club', function(req, res, next) {
    res.send('Club created!');
//    res.render('organization', { message: 'Club created!' });
});

router.put('/order', function(req, res, next) {
    res.send('Order created!');
//    res.render('organization', { message: 'Order created!' });
});

module.exports = router;
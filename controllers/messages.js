var express = require('express');
var router = express.Router();
var messages = require('../models/message.js');
var inputValidator = require('../models/input-validator.js');

router.get('/', function(req, res, next) {
    var userId = req.session.user.userId;
    console.log('Get a message');
});

router.post('/', function(req, res, next) {
    var userId = req.session.user.userId;
    var message = req.body.messageContent;
    var inputError = inputValidator.encodeMessage(message);
    
    if(!inputError) {
        res.send('<p class="message">Message sent</p>');
    }
    else {
        res.send('<p class="errorMessage">Error sending message, please try again later</p>');
    }
});


module.exports = router;
var express = require('express');
var router = express.Router();
var messages = require('../models/message.js');
var users = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');

//Get a user's mailbox
router.get('/', function(req, res, next) {
    var userId = req.session.user.userId;
    var statusMessage = req.session.message;
    var errMessage = req.session.errorMessage;
    req.session.message = null;
    req.session.errorMessage = null;
    
    messages.getListOfMessages(userId, function(err, listOfMessages) {
        if(!err && listOfMessages) {
//            for(var convo in conversations) {
//                
//            }
            res.render('mailbox', { inbox: listOfMessages, message: statusMessage, errorMessage: errMessage });
        }
        else {
            res.render('mailbox', { errorMessage: err.message });
        }
    });
});

//Send a message to a user
router.post('/send', function(req, res, next) {
    var userId = req.session.user.userId;
    var userToSendTo = req.body.userToSendTo;
    var message = inputValidator.encodeString(req.body.messageContent);
    var currentTime = Date.now();
    
    users.getUserByName(userToSendTo, function(err, receiver) {
        if(!err && receiver) {
            var receiverId = receiver.user_id;
            var convoExists = doesConversationExist(userId, receiverId);

            if(convoExists) {
                messages.replyToConversation(userId, receiverId, convoExists, message, currentTime, function onConversationReply(err, result) {
                    req.session.message = 'Message sent';
                    res.redirect('/mailbox');
                });
            }
            else {
                messages.createConversation(userId, receiverId, function(err, result) {
                    if(!err && result) {
                        messages.replyToConversation(userId, receiverId, result, message, currentTime, function onConversationCreation(err, result) {
                            req.session.message = 'Message sent';
                            res.redirect('/mailbox');
                        });
                    }
                    else {
                        req.session.errorMessage = err.message;
                        res.redirect('/mailbox');
                    }
                });
            }
        }
        else {
            req.session.errorMessage = err ? err.message : 'That user doesn\'t exist';
            res.redirect('/mailbox');
        }
    });
});


var doesConversationExist = function(senderId, receiverId) {
    messages.getConversation(senderId, receiverId, function onGetConversation(err, conversation) {
        if(!err && conversation) {
            return conversation.conversation_id;
        }
    });
}


module.exports = router;
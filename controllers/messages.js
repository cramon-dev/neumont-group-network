var express = require('express');
var router = express.Router();
var messageModel = require('../models/message.js');
var userModel = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');

router.get('/:userid', function(req, res, next) {
    var userId = req.session.user.userId;
    console.log('User id: ' + userId);
    messageModel.getListOfConversations(userId, function(err, listOfConversations) {
        if(!err && listOfConversations) {
            res.json(listOfConversations);
        }
        else {
            res.status(err.statusCode).json(err);
        }
    });
});

router.post('/:receiverId', function(req, res, next) {
    var receiverId = req.params.receiverId;
});

// router.get('/', function(req, res, next) {
//     var userId = req.session.user.userId;
//     var statusMessage = req.session.message;
//     var previousErrorMessage = req.session.errorMessage;
    
//     messageModel.getConvosAndReplies(userId, function(err, listOfConversations) {
//         if(!err && listOfConversations) {
//             for(var convo in conversations) {
                
//             }
// //            res.render('mailbox', { inbox: listOfConversations });
//         }
//         else {
//             res.render('mailbox', { errorMessage: err.message });
//         }
//     });
// });

// router.post('/send', function(req, res, next) {
//     var userId = req.session.user.userId;
//     var userToSendTo = req.body.userToSendTo;
//     var message = inputValidator.encodeString(req.body.messageContent);
//     var currentTime = Date.now();
    
//     userModel.getUserByName(userToSendTo, function(err, receiver) {
//         if(!err && receiver) {
//             var receiverId = receiver.user_id;
//             var convoExists = doesConversationExist(userId, receiverId);

//             if(convoExists) {
//                 messageModel.replyToConversation(userId, receiverId, convoExists, message, currentTime, function(err, result) {
//                     req.session.message = 'Message sent';
//                     res.redirect('/mailbox');
//                 });
//             }
//             else {
//                 messageModel.createConversation(userId, receiverId, function(err, result) {
//                     if(!err && result) {
//                         messageModel.replyToConversation(userId, receiverId, result, message, currentTime, function(err, result) {
//                             req.session.message = 'Message sent';
//                             res.redirect('/mailbox');
//                         });
//                     }
//                     else {
//                         req.session.errorMessage = err.message;
//                         res.redirect('/mailbox');
//                     }
//                 });
//             }
//         }
//         else {
//             req.session.errorMessage = err.message;
//             res.redirect('/mailbox');
//         }
//     });
// });


var doesConversationExist = function(senderId, receiverId) {
    messageModel.getConversation(senderId, receiverId, function(err, conversation) {
        if(!err && conversation) {
            return conversation.conversation_id;
        }
    });
}


module.exports = router;
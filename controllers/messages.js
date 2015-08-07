var express = require('express');
var router = express.Router();
var messages = require('../models/message.js');
var users = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');

router.get('/:userId', function(req, res, next) {
    // if(authenticated) {
        var userId = req.params.userId;
        console.log('User id: ' + userId);
        messages.getListOfConversations(userId, function(err, listOfConversations) {
            if(!err && listOfConversations) {
                res.json(listOfConversations);
            }
            else {
                res.status(err.statusCode).json(err);
            }
        });
    // }
    // else {
    //     res.status(401);
    // }
});

// router.get('/', function(req, res, next) {
//     var userId = req.session.user.userId;
//     var statusMessage = req.session.message;
//     var previousErrorMessage = req.session.errorMessage;
    
//     messages.getConvosAndReplies(userId, function(err, listOfConversations) {
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
    
//     users.getUserByName(userToSendTo, function(err, receiver) {
//         if(!err && receiver) {
//             var receiverId = receiver.user_id;
//             var convoExists = doesConversationExist(userId, receiverId);

//             if(convoExists) {
//                 messages.replyToConversation(userId, receiverId, convoExists, message, currentTime, function(err, result) {
//                     req.session.message = 'Message sent';
//                     res.redirect('/mailbox');
//                 });
//             }
//             else {
//                 messages.createConversation(userId, receiverId, function(err, result) {
//                     if(!err && result) {
//                         messages.replyToConversation(userId, receiverId, result, message, currentTime, function(err, result) {
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
    messages.getConversation(senderId, receiverId, function(err, conversation) {
        if(!err && conversation) {
            return conversation.conversation_id;
        }
    });
}


module.exports = router;
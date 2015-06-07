var dbManager = require('./db-manager.js');
var inputValidator = require('./input-validator.js');


exports.createConversation = function(senderId, receiverId, callback) {
    dbManager.createConversation(senderId, receiverId, function onModelCreateConversation(err, result) {
        callback(err, result);
    });
}

exports.getConversation = function(user1Id, user2Id, callback) {
    dbManager.getConversation(user1Id, user2Id, function onModelGetConversation(err, conversation) {
        callback(err, conversation);
    });
}

exports.getListOfMessages = function(userId, callback) {
    dbManager.getListOfMessages(userId, function onModelGetListOfMessages(err, listOfMessages) {
        console.log('Decoding messages from base64 to utf8');
        for(var i in listOfMessages) {
            var content = listOfMessages[i].message;
            console.log('Inside for loop, message content before decoding: ' + content);
            listOfMessages[i].message = inputValidator.decodeString(content);
            console.log('After decoding: ' + listOfMessages[i].message);
        }
        console.log('Messages decoded');
        callback(err, listOfMessages);
    });
}

exports.replyToConversation = function(senderId, receiverId, conversationId, content, timeSent, callback) {
    var message = inputValidator.encodeString(content);
    dbManager.replyToConversation(senderId, receiverId, conversationId, message, timeSent, function onModelReplyToConversation(err, result) {
        callback(err, result);
    });
}

////What use does this have?
//exports.getListOfReplies = function(conversationId, callback) {
//    dbManager.getListOfReplies(conversationId, function(err, listOfReplies) {
//        callback(err, listOfReplies);
//    });
//}
//
////What use does this have?
//exports.hasAccessToMessage = function(userId, callback) {
//    // ???
//}
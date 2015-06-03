var dbManager = require('./db-manager.js');


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
        callback(err, listOfMessages);
    });
}

exports.replyToConversation = function(senderId, receiverId, conversationId, content, timeSent, callback) {
    dbManager.replyToConversation(senderId, receiverId, conversationId, content, timeSent, function onModelReplyToConversation(err, result) {
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
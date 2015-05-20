var dbManager = require('./db-manager.js');


exports.createConversation = function(senderId, receiverId, callback) {
    dbManager.createConversation(senderId, receiverId, function(err, result) {
        callback(err, result);
    });
}

exports.getConversation = function(user1Id, user2Id, callback) {
    dbManager.getConversation(user1Id, user2Id, function(err, conversation) {
        callback(err, conversation);
    });
}

exports.getListOfConversations = function(userId, callback) {
    dbManager.getListOfConversations(userId, function(err, listOfConversations) {
        callback(err, listOfConversations);
    });
}

exports.replyToConversation = function(senderId, receiverId, conversationId, content, callback) {
    dbManager.replyToConversation(senderId, receiverId, conversationId, content, function(err, result) {
        callback(err, result);
    });
}

exports.getListOfReplies = function(conversationId, callback) {
    dbManager.getListOfReplies(conversationId, function(err, listOfReplies) {
        callback(err, listOfReplies);
    });
}

exports.hasAccessToMessage = function(userId, callback) {
    // ???
}
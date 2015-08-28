var dbManager = require('./db-manager.js');

//Encode a comment as base 64 and add it to the comments table
exports.addComment = function(eventId, userId, comment, callback) {
    dbManager.addComment(eventId, userId, comment, function onInsertComment(err, result) {
        callback(err, result);
    });
}

//Get a list of comments and decode the strings to UTF-8
exports.getComments = function(eventId, callback) {
    dbManager.getComments(eventId, function onRetrieveComments(err, listOfComments) {
        callback(err, listOfComments);
    });
}
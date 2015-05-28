var dbManager = require('./db-manager.js');
var inputValidator = require('./input-validator.js');

//Encode a comment as base 64 and add it to the comments table
exports.addComment = function(eventId, userId, comment, callback) {
    var encodedComment = inputValidator.encodeString(comment);
    dbManager.addComment(eventId, userId, encodedComment, function onInsertComment(err, result) {
        callback(err, result);
    });
}

//Get a list of comments and decode the strings to UTF-8
exports.getComments = function(eventId, callback) {
    dbManager.getComments(eventId, function onRetrieveComments(err, listOfComments) {
        for(var result in listOfComments) {
            var comment = listOfComments[result].message;
            listOfComments[result].message = inputValidator.decodeString(comment);
        }
        callback(err, listOfComments);
    });
}
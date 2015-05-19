var dbManager = require('./db-manager.js');


exports.addComment = function(comment, callback) {
    dbManager.addComment(comment, function onInsertComment(err, result) {
        callback(err, result);
    });
}

exports.getComment = function(commentId, callback) {
    dbManager.getComment(commentId, function onRetrieveComment(err, comment) {
        callback(err, comment);
    });
}
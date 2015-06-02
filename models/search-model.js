var dbManager = require('./db-manager.js');

exports.getListOfOrgsByKeywords = function(keywords, callback) {
    dbManager.getListOfOrgsByKeywords(keywords, function onListOfOrgsRetrieval(err, searchResults) {
        callback(err, searchResults);
    });
}
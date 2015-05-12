var dbManager = require('./db-manager.js');

exports.getListOfOrgsByOneKeyword = function(keyword, callback) {
    dbManager.getListOfOrgsByOneKeyword(keyword, function onListOfOrgsRetrieval(err, searchResults) {
        callback(err, searchResults);
    });
}

exports.getListOfOrgsByMultipleKeywords = function(keywords, callback) {
    console.log('Get list of orgs by multiple keywords/tags not implemented yet');
}
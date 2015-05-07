var dbManager = require('./db-manager.js');

exports.getOrganization = function(orgId, callback) {
    dbManager.getOrganization(orgId, function onRetrieval(err, data) {
        callback(err, data);
    });
}

exports.addNewOrganization = function(orgName, orgDesc, callback) {
    dbManager.addNewOrganization(orgName, orgDesc, function onInsert(err, result) {
        callback(err, result);
    });
}
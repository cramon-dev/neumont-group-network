var dbManager = require('./db-manager.js');

exports.getOrganization = function(orgId, callback) {
    dbManager.getOrganization(orgId, function onOrgRetrieval(err, data) {
        callback(err, data);
    });
}

exports.addNewOrganization = function(orgName, orgDesc, authorId, callback) {
    dbManager.addNewOrganization(orgName, orgDesc, authorId, function onOrgInsert(err, result) {
        callback(err, result);
    });
}

exports.editOrganization = function(orgId, newOrgName, newOrgDesc, callback) {
    dbManager.editOrganization(orgId, newOrgName, newOrgDesc, function onOrgUpdate(err, result) {
        callback(err, result);
    });
}
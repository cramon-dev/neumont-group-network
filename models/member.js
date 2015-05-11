var dbManager = require('./db-manager.js');

exports.getOrgMembers = function(orgId, callback) {
    dbManager.getOrgMembers(orgId, function onRetrieval(err, data) {
        callback(err, data);
    });
}

exports.addNewOrgMember = function(orgId, userId, isAdmin, callback) {
    dbManager.addNewOrgMember(orgId, userId, isAdmin, function onInsert(err, result) {
        callback(err, result);
    });
}

exports.getIsMemberAdmin = function(orgId, userId, callback) {
    dbManager.getIsMemberAdmin(orgId, userId, function onRetrieval(err, isAdmin) {
        var isMemberAdmin = isAdmin ? true : false;
        callback(err, isMemberAdmin);
    });
}

exports.isMemberOfOrg = function(orgId, userId, callback) {
    dbManager.isMemberOfOrg(orgId, userId, function onRetrieval(err, isMember) {
        callback(err, isMember);
    });
}
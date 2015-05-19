var dbManager = require('./db-manager.js');

var memberId, orgMemberIsPartOf, isAdmin;

exports.getOrgMembers = function(orgId, callback) {
    dbManager.getOrgMembers(orgId, function onMembersRetrieval(err, listOfMembers) {
        callback(err, listOfMembers);
    });
}

exports.getOrgMemberIds = function(orgId, callback) {
    dbManager.getOrgMembers(orgId, function onMemberIDsRetrieval(err, listOfMembers) {
        var listOfMemberIds = [];
        for(var key in listOfMembers) {
            listOfMemberIds.push(listOfMembers[key].member_id);
        }
        
        callback(err, listOfMemberIds);
    });
}

exports.getOrgMemberDetails = function(orgId, callback) {
    dbManager.getOrgMemberDetails(orgId, function onMemberDetailsRetrieval(err, listOfMemberDetails) {
        callback(err, listOfMemberDetails);
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
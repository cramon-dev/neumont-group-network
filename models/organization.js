var dbManager = require('./db-manager.js');

exports.getOrganization = function(orgId, callback) {
    dbManager.getOrganization(orgId, function onOrgRetrieval(err, data) {
        callback(err, data);
    });
}

exports.getAllOrganizations = function(callback) {
	dbManager.getAllOrganizations(function onOrgsRetrieval(err, listOfOrgs) {
		callback(err, listOfOrgs);
	});
}

exports.getAllOrgsUserIsMemberOf = function(userId, callback) {
    dbManager.getAllOrgsUserIsMemberOf(userId, function onOrgsRetrieval(err, listOfOrgs) {
        callback(err, listOfOrgs);
    });
}

exports.addNewOrganization = function(orgName, orgDesc, authorId, orgImagePath, callback) {
    dbManager.addNewOrganization(orgName, orgDesc, authorId, orgImagePath, function onOrgInsert(err, result) {
        callback(err, result);
    });
}

exports.editOrganization = function(orgId, newOrgName, newOrgDesc, callback) {
    dbManager.editOrganization(orgId, newOrgName, newOrgDesc, function onOrgUpdate(err, result) {
        callback(err, result);
    });
}
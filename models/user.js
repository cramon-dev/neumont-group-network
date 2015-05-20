var dbManager = require('./db-manager.js');

exports.registerNewUser = function(username, password, email, callback) {
    dbManager.registerNewUser(username, password, email, function onQuery(err, result) {
        callback(err, result);
    });
}

exports.authenticate = function(username, password, callback) {
    dbManager.authenticate(username, password, function onQuery(err, user) {
        callback(err, user);
    });
}

exports.getSingleUserDetails = function(userId, callback) {
    dbManager.getUserDetails(userId, function onQuery(err, userDetails) {
        callback(err, userDetails);
    });
}

exports.getListOfUserDetails = function(listOfUserIds, callback) {
    dbManager.getListOfUserDetails(listOfUserIds, function onQuery(err, listOfUsers) {
        callback(err, listOfUsers);
    });
}

exports.getUserByName = function(username, callback) {
    dbManager.getUserByName(username, function onQuery(err, user) {
        callback(err, user);
    });
}

exports.editUserDetails = function(newPassword, newEmail, userId, callback) {
    dbManager.editUserDetails(newPassword, newEmail, userId, function onQuery(err, result) {
        callback(err, result);
    });
}

exports.deleteUser = function(userId, callback) {
    dbManager.deleteUser(userId, function onQuery(err, result) {
        callback(err, result);
    });
}
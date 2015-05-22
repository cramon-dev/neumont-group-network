var dbManager = require('./db-manager.js');


exports.changeAttendanceStatus = function(userId, eventId, isAttending, callback) {
    dbManager.changeAttendanceStatus(userId, eventId, isAttending, function(err, result) {
        callback(err, result);
    });
}
 var dbManager = require('./db-manager.js');


exports.addNewEvent = function(eventTitle, eventDesc, eventStartDate, orgId, canUsersComment, eventImagePath, callback) {
    dbManager.addNewEvent(eventTitle, eventDesc, eventStartDate, orgId, canUsersComment, eventImagePath, function onAddNewEvent(err, result) {
        callback(err, result);
    });
}

exports.editEventDetails = function(newEventTitle, newEventDesc, newEventStartDate, eventId, canUsersComment, callback) {
    dbManager.editEventDetails(newEventTitle, newEventDesc, newEventStartDate, eventId, canUsersComment, function onEditEvent(err, result) {
        callback(err, result);
    });
}

exports.getEventDetails = function(eventId, callback) {
    dbManager.getEventDetails(eventId, function onGetEventDetails(err, eventDetails) {
        var canUsersComment = eventDetails.can_users_comment ? true : false;
        eventDetails.can_users_comment = canUsersComment;
        callback(err, eventDetails);
    });
}

exports.getListOfEvents = function(orgId, callback) {
    dbManager.retrieveAllEventsByOrgId(orgId, function onGetListOfEvents(err, listOfEvents) {
        callback(err, listOfEvents);
    });
}
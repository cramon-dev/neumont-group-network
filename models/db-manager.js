//Manage database connections and perform operations
var mysql = require('mysql');
var bcrypt = require('bcrypt');

//Connection pool
var pool = mysql.createPool({
    host: 'localhost',
    user: 'ngn-user',
    password: 'zJ7m9cdujSGrSvAq',
    database: 'ngn-db',
    connectionLimit: 10
});


// =========== Utility ===========

//Get a DB connection from the pool and give it to a callback
var getConnection = function(callback) {
    pool.getConnection(function onConnectionRetrieval(err, conn) {
        callback(err, conn);
    });
}

//Generate a new hash for a password
var generateNewHash = function(password_to_hash) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password_to_hash, salt);
}


// =========== Sign In/Registration ===========

//Register a new user
exports.registerNewUser = function(username, password, email, callback) {
    var hashedPassword = generateNewHash(password);
    
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' 
                             + username + '\', \'' + hashedPassword + '\', \'' + email + '\')', function onDBInsertUser(err, result) {
                if(!err) {
                    callback(null, result.insertId);
                }
                else {
                    callback(err, null);
                }
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Authenticate a user
exports.authenticate = function(username, password, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM users where username=\'' + username + '\' LIMIT 1', function onDBUserRetrieval(err, rows, fields) {
                //if user exists
                if(rows[0]) {
                    var user;

                    if(bcrypt.compareSync(password, rows[0].password)) {
                        user = { userId: rows[0].user_id, username: username, email: rows[0].email };
                    }
                    else {
                        user = null;
                    }

                    callback(err, user);
                }
                else {
                    callback(err, null);
                }

                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

// =========== Users ===========

//Get a single user's details
exports.getUserDetails = function(requestedId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM users where user_id=\'' + requestedId + '\' LIMIT 1', function onDBUserRetrieval(err, rows, fields) {
                //If user exists
                if(rows[0]) {
                    var user = { userId: rows[0].user_id, username: rows[0].username, email: rows[0].email };
                    
                    callback(err, user);
                }
                else {
                    callback(err, null);
                }
            });
        }
        else {
            callback(err, null);
            
            connection.release();
        }
    });
}

exports.getListOfUserDetails = function(requestedIDs, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM users', function onDBUserListRetrieval(err, rows, fields) {
                //If user exists
                if(rows) {
                    var listOfUsers = [];
                    for(var id in requestedIDs) {
                        for(var i = 0; i < rows.length; i++) {
                            if(rows[i].user_id === requestedIDs[id]) {
                                listOfUsers.push({ userId: rows[i].user_id, username: rows[i].username, email: rows[i].email });
                                i = rows.length; //Break out of loop early in a "safe" way 
                            }
                        }
                    }

                    callback(err, listOfUsers);
                }
                else {
                    callback(err, null);
                }
            });
        }
        else {
            callback(err, null);
            
            connection.release();
        }
    });
}


// =========== Organizations ===========

//Get an organization's information based off of ID
exports.getOrganization = function(requestedId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM organizations where organization_id=\'' + requestedId + '\' LIMIT 1', function onDBOrgRetrieval(err, rows, fields) {
                callback(err, rows[0]);

                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Add a new organization
exports.addNewOrganization = function(orgName, orgDesc, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('INSERT INTO `organizations`(`name`, `description`) VALUES (\'' + orgName + '\', \'' + orgDesc + '\')', function onDBInsertOrg(err, result) {
                //If insert was successful
                if(result) {
                    callback(err, result.insertId);
                }
                else {
                    callback(err, null);
                }
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}


//Edit an organization's information
exports.editOrganization = function(orgId, newOrgName, newOrgDesc, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('UPDATE `organizations` SET `name`=\'' + 
                             newOrgName + '\', `description`=\'' + newOrgDesc + '\' WHERE `organization_id`=\'' + orgId + '\'', function(err, result) {
                //If update was successful
                if(result) {
                    callback(err, result.insertId);
                }
                else {
                    callback(err, null);
                }
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}


// =========== Members ===========

//Get all members of an organization based on organization ID
exports.getOrgMembers = function(orgId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM members where org_id = \'' + orgId + '\'', function onDBMembersRetrieval(err, rows, fields) {
                callback(err, rows);

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Add a new member of an organization
exports.addNewOrgMember = function(orgId, userId, isAdmin, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            isAdmin = (isAdmin === true) ? 1 : 0;
            
            connection.query('INSERT INTO `members`(`org_id`, `member_id`, `is_admin`) VALUES (\'' 
                             + orgId + '\', \'' + userId + '\', \'' + isAdmin + '\')', function onOrgMemberInsert(err, result) {
                callback(err, result);

                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Get a member's admin status
exports.getIsMemberAdmin = function(orgId, userId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT is_admin FROM members where member_id=\'' + userId + '\' AND org_id=\'' + orgId + '\' LIMIT 1', function onIsAdminRetrieval(err, rows, fields) {
                if(rows[0]) {
                    callback(null, rows[0].is_admin);
                }
                else {
                    callback(null, false);
                }

                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Check if user is a member of an organization
exports.isMemberOfOrg = function(orgId, userId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT member_id FROM members where member_id=\'' + userId + '\' AND org_id=\'' + orgId + '\' LIMIT 1', function onRetrieval(err, rows, fields) {
                if(rows[0]) {
                    callback(err, true);
                }
                else {
                    callback(err, false);
                }

                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}


// =========== Events ===========

//Get an event's details
exports.getEventDetails = function(eventId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM events where event_id=\'' + eventId + '\' LIMIT 1', function onDBEventInsert(err, rows, fields) {
                if(rows[0]) {
                    var canUsersComment = rows[0].can_users_comment ? true : false;
                    rows[0].can_users_comment = canUsersComment;
                    callback(err, rows[0]);
                }
                else {
                    callback(err, null);
                }
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Add a new event
exports.addNewEvent = function(eventTitle, eventDesc, eventStartDate, orgId, canUsersComment, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            var convertedCanUsersComment = canUsersComment ? 1 : 0;
            connection.query('INSERT INTO `events`(`title`, `description`, `start_date`, `org_id`, `can_users_comment`) VALUES (\'' +
                                eventTitle + '\', \'' + eventDesc + '\', \'' + eventStartDate + '\', \'' + orgId + '\', \'' + canUsersComment + '\')', function onDBEventInsert(err, result) {
                callback(err, result.insertId);
                
                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Edit an event
exports.editEventDetails = function(newEventTitle, newEventDesc, newEventStartDate, eventId, canUsersComment, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            var convertedCanUsersComment = canUsersComment ? 1 : 0;
            connection.query('UPDATE `events` SET `title`=\'' + newEventTitle + '\', `description`=\'' + 
                             newEventDesc + '\', `start_date`=\'' + newEventStartDate + '\', `can_users_comment`=\'' +
                                convertedCanUsersComment + '\' WHERE `event_id`=\'' + eventId + '\'', function onUpdateEvent(err, result) {
                callback(err, result);
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Get all events posted to a specific organization
exports.retrieveAllEventsByOrgID = function(orgId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM events where org_id=\'' + orgId + '\'', function(err, rows, fields) {
                callback(err, rows);
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

////Get all events
//var retrieveAllEvents = function(callback) {
//    getConnection(function onConnect(err, connection) {
//        if(!err) {
//            connection.query('SELECT * FROM events', function(err, rows, fields) {
//                callback(err, rows);
//                
//                connection.release();
//            });
//        }
//        else {
//            //Maybe I should just throw an error.. or should I callback with the error?
//            throw err;
//        }
//    });
//}
//
//
////Get a single event's details based on requested ID
//var retrieveSingleEventDetails = function(requestedEventId, callback) {
//    getConnection(function onConnect(err, connection) {
//        if(!err) {
//            connection.query('SELECT * FROM events where event_id=\'' + requestedEventId + '\' LIMIT 1', function(err, rows, fields) {
//                callback(err, rows[0]);
//            
//                connection.release();
//            }); 
//        }
//        else {
//            //Should I callback with the error?
//            callback(err, null);
//        }
//    });
//}


//// =========== Comments ===========
//
////Add a new comment
//var addNewComment = function(commentMessage, authorUsername, eventIdPostingTo, callback) {
//    getConnection(function onConnect(err, connection) {
//        if(!err) {
//            var currentDate = Date.now();
//            connection.query('INSERT INTO `comments`(`message`, `time_posted`, `author_username`, `event_id`) VALUES (\'' 
//                             + commentMessage + '\', \'' + currentDate + '\', \'' + authorUsername + '\', \'' + eventIdPostingTo + '\')', function(err, rows, fields) {
//                callback(err);
//                
//                console.log('Added new comment');
//                connection.release();
//            });
//        }
//        else {
//            callback(err);
//        }
//    });
//}
//
////Retrieve all comments posted on a particular event
//var retrieveAllCommentsWhere = function(eventIdPostedTo, callback) {
//    getConnection(function onConnect(err, connection) {
//        if(!err) {
//            connection.query('SELECT * FROM comments where event_id=\'' + eventIdPostedTo + '\'', function(err, rows, fields) {
//                callback(err, rows);
//                
//                connection.release();
//            });
//        }
//        else {
//            callback(err, null);
//        }
//    });
//}
//

//connection.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')', function(err, rows, fields) {
//    if (err) {
//        console.log("throwing error");
//        throw err;
//    }
//    else {
//        console.log("User successfully recorded in database");
//    }
//});

//console.log("==== Retrieved user from database ====");
//console.log("==== Fields[0]: " + fields[0] + " ====");
//console.log("==== Rows[0]: " + rows[0] + " ====");
//console.log("==== Retrieved user ID: " + rows[0].user_id + " ====");
//console.log("==== Retrieved username: " + rows[0].username + " ====");
//console.log("==== Retrieved password: " + rows[0].password + " ====");
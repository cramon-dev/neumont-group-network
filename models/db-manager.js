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
                        //won't work because I have to iterate over both requested IDs list and database results
                        if(rows[0].user_id === requestedIDs[id]) {
                            listOfUsers.push({ userId: rows[0].user_id, username: rows[0].username, email: rows[0].email });
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
                             newOrgDesc + '\', `description`=\'' + newOrgDesc + '\' WHERE `organization_id`=\'' + orgId + '\'', function(err, result) {
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
                             + orgId + '\', \'' + userId + '\', \'' + isAdmin + '\')', function onInsert(err, result) {
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
            connection.query('SELECT is_admin FROM members where member_id=\'' + userId + '\' AND org_id=\'' + orgId + '\' LIMIT 1', function onRetrieval(err, rows, fields) {
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



//// =========== Events ===========
//
//var addNewEvent = function(org_id, new_event_title, new_event_desc, new_event_date, can_users_comment, callback) {
//    getConnection(function onConnect(err, connection) {
//        if(!err) {
//            connection.query('INSERT INTO `events`(`org_id`, `title`, `description`, `start_date`, `can_users_comment`) VALUES (\'' +
//                                org_id + '\', \'' + new_event_title + '\', \'' + new_event_desc + '\', \'' + new_event_date 
//                                    + '\', \'' + can_users_comment + '\')', function(err, rows, fields) {
//                if(err) {
//                    callback(err);
//                }
//                else {
//                    callback(null);
//                }
//                
//                connection.release();
//            });
//        }
//        else {
//            throw err;
//        }
//    });
//}
//
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
////Get all events based on one organization's ID
//var retrieveAllEventsByOrgID = function(requested_org_id, callback) {
//    getConnection(function onConnect(err, connection) {
//        if(!err) {
//            connection.query('SELECT * FROM events where org_id=\'' + requested_org_id + '\'', function(err, rows, fields) {
//                callback(err, rows);
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
//
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


//How can I clean this up?
//Should I not export mysql connections to other classes?
//Should I just let the db manager handle connections?

//module.exports.getConnection = getConnection;
//module.exports.checkInvalidInput = checkInvalidInput;
//module.exports.registerNewUser = registerNewUser;
//module.exports.signIn = signIn;
//module.exports.retrieveUser = retrieveUser;
//module.exports.retrieveAllUsers = retrieveAllUsers;
//module.exports.retrieveUserIdByUsername = retrieveUserIdByUsername;
//module.exports.retrieveUsernameByID = retrieveUsernameByID;
//module.exports.getOrganization = getOrganization;
//module.exports.getOrgIDByName = getOrgIDByName;
//module.exports.addNewOrganization = addNewOrganization;
//module.exports.alterOrganizationInfo = alterOrganizationInfo;
//module.exports.addNewEvent = addNewEvent;
//module.exports.retrieveAllEvents = retrieveAllEvents;
//module.exports.retrieveAllEventsByOrgID = retrieveAllEventsByOrgID;
//module.exports.retrieveSingleEventDetails = retrieveSingleEventDetails;
//module.exports.addNewComment = addNewComment;
//module.exports.retrieveAllCommentsWhere = retrieveAllCommentsWhere;
//module.exports.addNewMemberToOrg = addNewMemberToOrg;
//module.exports.retrieveMembersOfOrg = retrieveMembersOfOrg;
//module.exports.retrieveIsMemberAdmin = retrieveIsMemberAdmin;


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
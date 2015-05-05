//AUTHOR'S NOTE
//Considering altering this class so that it only has a few methods such as: selectFrom, insertInto, updateWhere, and so on
//How hard would it be to implement this and how much easier would it make my life?

//Manage DB connection and check for potentially malicious input with this DB manager
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


//Utility

//Get a DB connection from the pool and give it to a callback
var getConnection = function(callback) {
    pool.getConnection(function(err, conn) {
        callback(err, conn);
    });
}

//Check for potentially malicious input
//Does not currently protect against SQL injection
var checkInvalidInput = function(inputString) {
    if(inputString.indexOf('<script') > -1) {
        console.log("Potentially malicious content found");
        throw {
            name: "InvalidInputException",
            message: "Invalid input"
        };
    }
    else {
        return inputString;
    }
}

//Generate a new hash for a password
var generateNewHash = function(password_to_hash) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password_to_hash, salt);
}

////Most queries executed will invoke a given callback?
////I was thinking instead of having connection.query('query', function(err, rows, fields) { .. }); I could use this method and reduce the number of identical lines of code
//
//var sendDataToCallback = function(err, rows, fields) {
//    callback(err, rows);
//}

//Sign In/Registration

//Register a new user
var registerNewUser = function(username, password, email, callback) {
    var hashed_password = generateNewHash(password);
    
    getConnection(function onConnect(err, connection) {
        connection.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + hashed_password + '\', \'' + email + '\')', function(err, rows, fields) {
            callback(err);
            
            connection.release();
        });
    });
}

//Sign a user in
var signIn = function(username, callback) {
    getConnection(function onConnect(err, connection) {
        connection.query('SELECT * FROM users where username=\'' + username + '\' LIMIT 1', function(err, rows, fields) {
            var userCredentials = { userId: rows[0].user_id, password: rows[0].password };
            callback(err, userCredentials);
            
            connection.release();
        });
    });
}


//Users

//Get a user's user ID and username based off requested user ID
var retrieveUser = function(requested_id, callback) {
    getConnection(function(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM users where user_id=\'' + requested_id + '\' LIMIT 1', function(err, rows, fields) {
                var user = { userId: rows[0].user_id, username: rows[0].username };
                callback(err, user);

                connection.release();
            });
        }
        else {
            throw err;
        }
    }); 
}

//Get all users
var retrieveAllUsers = function(callback) {
    getConnection(function(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM users', function(err, rows, fields) {
                if(err) {
                    callback(err, null);
                }
                else {
                    var user_details = [];

                    for(var i = 0; i < rows.length; i++) {
                        user_details.push({ user_id: rows[i].user_id, username: rows[i].username });
                    }

                    callback(null, user_details);
                }

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Get a user ID by username
var retrieveUserIdByUsername = function(username, callback) {
    getConnection(function(err, connection) {
        if(!err) {
            connection.query('SELECT `user_id` FROM users where username=\'' + username + '\' LIMIT 1', function(err, rows, fields) {
                callback(err, rows[0].user_id);

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Get a username by user ID
var retrieveUsernameByID = function(user_id, callback) {
    getConnection(function(err, connection) {
        if(!err) {
            connection.query('SELECT `username` FROM users where user_id=\'' + user_id + '\' LIMIT 1', function(err, rows, fields) {
                callback(err, rows[0].username);

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}


//Organizations

//Get an organization's information based off of ID
var getOrganization = function(requested_id, callback) {
    getConnection(function(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM organizations where organization_id=\'' + requested_id + '\' LIMIT 1', function(err, rows, fields) {
                callback(err, rows[0]);

                connection.release();
        //        callback(null, rows[0].organization_id, rows[0].name, rows[0].description);
            });
        }
        else {
            throw err;
        }
    });
}

//Get an organization's ID by name
var getOrgIDByName = function(requested_org_name, callback) {
    getConnection(function(err, connection) {
        if(!err) {
            connection.query('SELECT organization_id FROM organizations where name=\'' + requested_org_name + '\' LIMIT 1', function(err, rows, fields) {
                callback(err, rows[0].organization_id);

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Add a new organization
var addNewOrganization = function(org_name, org_desc, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('INSERT INTO `organizations`(`name`, `description`) VALUES (\'' + org_name + '\', \'' + org_desc + '\')', function(err, rows, fields) {
                callback(err);
                
                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Edit an organization's information
var alterOrganizationInfo = function(org_id, new_org_name, new_org_desc, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('UPDATE `organizations` SET `name` = \'' + 
                          new_org_name + '\', `description` = \'' + new_org_desc + '\' WHERE `organization_id` = \'' + org_id + '\'', function(err, rows, fields) {
                callback(err);

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}


//Events

var addNewEvent = function(org_id, new_event_title, new_event_desc, new_event_date, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('INSERT INTO `events`(`event_org_id`, `title`, `description`, `start_date`) VALUES (\'' +
                                org_id + '\', \'' + new_event_title + '\', \'' + new_event_desc + '\', \'' + new_event_date + '\')', function(err, rows, fields) {
                if(err) {
                    callback(err);
                }
                else {
                    callback(null);
                }
                
                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Get all events
var retrieveAllEvents = function(callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM events', function(err, rows, fields) {
                callback(err, rows);
                
                connection.release();
            });
        }
        else {
            //Maybe I should just throw an error.. or should I callback with the error?
            throw err;
        }
    });
}

//Get all events based on one organization's ID
var retrieveAllEventsByOrgID = function(requested_org_id, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM events where event_org_id=\'' + requested_org_id + '\'', function(err, rows, fields) {
                callback(err, rows);
                
                connection.release();
            });
        }
        else {            
            //Should I callback with the error?
            callback(err, null);
        }
    });
}

//Get a single event's details based on requested ID
var retrieveSingleEventDetails = function(requestedEventId, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM events where event_id=\'' + requestedEventId + '\' LIMIT 1', function(err, rows, fields) {
                callback(err, rows[0]);
            
                connection.release();
            }); 
        }
        else {
            //Should I callback with the error?
            callback(err, null);
        }
    });
}

var addNewComment = function(commentMessage, authorUsername, eventIdPostingTo, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            var currentDate = Date.now();
            connection.query('INSERT INTO `comments`(`message`, `time_posted`, `author_username`, `event_id`) VALUES (\'' 
                             + commentMessage + '\', \'' + currentDate + '\', \'' + authorUsername + '\', \'' + eventIdPostingTo + '\')', function(err, rows, fields) {
                callback(err);
                
                console.log('Added new comment');
                connection.release();
            });
        }
        else {
            callback(err);
        }
    });
}

var retrieveAllCommentsWhere = function(eventIdPostedTo, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM comments where event_id=\'' + eventIdPostedTo + '\'', function(err, rows, fields) {
                callback(err, rows);
                
                connection.release();
            });
        }
        else {
            callback(err, null);
        }
    });
}

//Members

//Add a new member of an organization
var addNewMemberToOrg = function(org_id, new_member_id, is_admin, callback) {
    getConnection(function onConnect(err, connection) {
        connection.query('INSERT INTO `members`(`org_id`, `member_id`, `is_admin`) VALUES (\'' 
                         + org_id + '\', \'' + new_member_id + '\', \'' + is_admin + '\')', function(err, rows, fields) {
            callback(err);

            connection.release();
        });
    });
}

//Get all members of an organization based on organization ID
var retrieveMembersOfOrg = function(org_id, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT * FROM members where org_id = \'' + org_id + '\'', function(err, rows, fields) {
                callback(err, rows);

                connection.release();
            });
        }
        else {
            throw err;
        }
    });
}

//Get a member's admin status
var retrieveIsMemberAdmin = function(org_id, member_id, callback) {
    getConnection(function onConnect(err, connection) {
        if(!err) {
            connection.query('SELECT is_admin FROM members where member_id=\'' + member_id + '\' AND org_id=\'' + org_id + '\' LIMIT 1', function(err, rows, fields) {
                console.log('is admin before ternary ' + rows);
                var isMemberAdmin = rows ? true : false;
                
                callback(isMemberAdmin);

                connection.release();
            });
        }
        else {
            throw err;   
        }
    });
}


//How can I clean this up?
//Should I not export mysql connections to other classes?
//Should I just let the db manager handle connections?

module.exports.getConnection = getConnection;
module.exports.checkInvalidInput = checkInvalidInput;
module.exports.registerNewUser = registerNewUser;
module.exports.signIn = signIn;
module.exports.retrieveUser = retrieveUser;
module.exports.retrieveAllUsers = retrieveAllUsers;
module.exports.retrieveUserIdByUsername = retrieveUserIdByUsername;
module.exports.retrieveUsernameByID = retrieveUsernameByID;
module.exports.getOrganization = getOrganization;
module.exports.getOrgIDByName = getOrgIDByName;
module.exports.addNewOrganization = addNewOrganization;
module.exports.alterOrganizationInfo = alterOrganizationInfo;
module.exports.addNewEvent = addNewEvent;
module.exports.retrieveAllEvents = retrieveAllEvents;
module.exports.retrieveAllEventsByOrgID = retrieveAllEventsByOrgID;
module.exports.retrieveSingleEventDetails = retrieveSingleEventDetails;
module.exports.addNewComment = addNewComment;
module.exports.retrieveAllCommentsWhere = retrieveAllCommentsWhere;
module.exports.addNewMemberToOrg = addNewMemberToOrg;
module.exports.retrieveMembersOfOrg = retrieveMembersOfOrg;
module.exports.retrieveIsMemberAdmin = retrieveIsMemberAdmin;


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
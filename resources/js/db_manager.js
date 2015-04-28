//Manage DB connection and check for potentially malicious input with this DB manager
var mysql = require('mysql');
var bcrypt = require('bcrypt');

var createConnectionToDB = function() {
    console.log("Creating connection to database..");
    
    var db_conn = new mysql.createConnection({
        host: 'localhost',
        user: 'ngn-user',
        password: 'zJ7m9cdujSGrSvAq',
        database: 'ngn-db'
    });
    
    db_conn.connect();
    
    console.log("Successfully connected to database, returning connection");
    return(db_conn);
}


//Utility

var checkInvalidInput = function(input_string) {
    //If input contains any scripts, kick them back to register
    //Does not currently protect against SQL injection
    if(input_string.indexOf('<script') > -1) {
        console.log("Potentially malicious content found");
        throw {
            name: "InvalidInputException",
            message: "Invalid input."
        };
    }
    else {
        return input_string;
    }
}


//Sign In/Registration

var registerNewUser = function(db_conn, username, password, email, callback) {
    var hashed_password = generateNewHash(password);
    db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + hashed_password + '\', \'' + email + '\')', function(err, rows, fields) {
        if (err) {
            callback(err);
        }
        else {
            callback(null);
        }
    });
}

var signIn = function(db_conn, username, callback) {
    db_conn.query('SELECT * FROM users where username=\'' + username + '\' LIMIT 1', function(err, rows, fields) {
        if(err) {
            callback(err, null, null);
        }
        else {
            callback(null, rows[0].password, rows[0].user_id);
        }
    });
}

var generateNewHash = function(password_to_hash) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password_to_hash, salt);
}


//Users

var retrieveUser = function(db_conn, requested_id, callback) {
    db_conn.query('SELECT * FROM users where user_id=\'' + requested_id + '\' LIMIT 1', function(err, rows, fields) {
        if(err) {
            callback(err, null, null);
        }
        else {
            callback(null, rows[0].user_id, rows[0].username);
        }
    });
}

var retrieveAllUsers = function(db_conn, callback) {
    db_conn.query('SELECT * FROM users', function(err, rows, fields) {
        if(err) {
            callback(err, null);
        }
        else {
            var user_details = [];
            for(var i = 0; i < rows.length; i++) {
                user_details.push({ user_id: rows[i].user_id, username: rows[i].username });
//                console.log("User ID " + i + ": " + user_details[i].user_id);
//                console.log("Username " + i + ": " + user_details[i].username);
            }
            callback(null, user_details);
        }
    });
}

var retrieveUserIdByUsername = function(db_conn, username, callback) {
    db_conn.query('SELECT `user_id` FROM users where username=\'' + username + '\' LIMIT 1', function(err, rows, fields) {
        if(err) {
            callback(err, null);
        }
        else {
            console.log("User ID of " + username + ": " + rows[0].user_id);
            callback(null, rows[0].user_id);
        }
    });
}

var retrieveUsernameByID = function(db_conn, user_id, callback) {
    db_conn.query('SELECT `username` FROM users where user_id=\'' + user_id + '\'', function(err, rows, fields) {
        if(err) {
            callback(err, null);
        }
        else {
            callback(null, rows[0].username);
        }
    });
}


//Organizations

var getOrganization = function(db_conn, requested_id, callback) {
    db_conn.query('SELECT * FROM organizations where organization_id=\'' + requested_id + '\' LIMIT 1', function(err, rows, fields) {
        if(err) {
            callback(err, null, null);
        }
        else {
            callback(null, rows[0].organization_id, rows[0].name, rows[0].description);
        }
    });
}

var getOrgIDByName = function(db_conn, requested_org_name, callback) {
    db_conn.query('SELECT organization_id FROM organizations where name=\'' + requested_org_name + '\'', function(err, rows, fields) {
        if(err) {
            callback(err, null);
        }
        else {
            callback(null, rows[0].organization_id);
        }
    });
}

var addNewOrganization = function(db_conn, org_name, org_desc, callback) {
    db_conn.query('INSERT INTO `organizations`(`name`, `description`) VALUES (\'' + org_name + '\', \'' + org_desc + '\')', function(err, rows, fields) {
        if(err) {
            callback(err);
        }
        else {
            callback(null);
        }
    });
}

var addNewMemberToOrg = function(db_conn, org_id, new_member_id, is_admin, callback) {
    db_conn.query('INSERT INTO `members`(`org_id`, `member_id`, `is_admin`) VALUES (\'' + org_id + '\', \'' + new_member_id + '\', \'' + is_admin + '\')', function(err, rows, fields) {
        if(err) {
            callback(err);
        }
        else {
            callback(null);
        }
    });
}

var retrieveMembersOfOrg = function(db_conn, org_id, callback) {
    db_conn.query('SELECT * FROM members where org_id = \'' + org_id + '\'', function(err, rows, fields) {
        if(err) {
            callback(err, null);
        }
        else { 
            console.log(rows);
            callback(null, rows);
        }
    });
}

var retrieveIsMemberAdmin = function(db_conn, org_id, member_id, callback) {
    db_conn.query('SELECT is_admin FROM members where member_id=\'' + member_id + '\' AND org_id=\'' + org_id + '\'', function(err, rows, fields) {
        var boolToReturn = rows[0].is_admin ? true : false;
        
        if(err) {
            callback(err);
        }
        else {
            callback(boolToReturn);
        }  
    });
}

var alterOrganizationInfo = function(db_conn, org_id, new_org_name, new_org_desc, callback) {
    db_conn.query('UPDATE `organizations` SET `name` = \'' + new_org_name + '\', `description` = \'' + new_org_desc + '\' WHERE `organization_id` = \'' + org_id + '\'', function(err, rows, fields) {
        if(err) {
            callback(err);
        }
        else {
            callback(null);
        }
    });
}


module.exports.createConnectionToDB = createConnectionToDB;
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
module.exports.addNewMemberToOrg = addNewMemberToOrg;
module.exports.alterOrganizationInfo = alterOrganizationInfo;
module.exports.retrieveIsMemberAdmin = retrieveIsMemberAdmin;
module.exports.retrieveMembersOfOrg = retrieveMembersOfOrg;


//db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')', function(err, rows, fields) {
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
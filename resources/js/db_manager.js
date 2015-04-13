//Manage DB connection and check for potentially malicious input with this DB manager
var mysql = require('mysql');

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

var registerNewUser = function(db_conn, username, password, email) {
    var errToThrow;
    
    db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')', function(err, rows, fields) {
        console.log("Inside callback query");
        console.log("Callback query error: " + err);
        if (err === null) {
            console.log("No error found while inserting user");
            return true;
        }
        else {
            console.log("Error found while inserting user");
            console.log(err);
            errToThrow = err;
        }
//        return false;
    });
    
    if(errToThrow !== null) {
        throw errToThrow;
    }
}

var signIn = function(db_conn, username, password) {
    db_conn.query('SELECT * FROM users where username=\'' + username + '\' and password=\'' + password + '\'', function(err, rows, fields) {
        if (err) {
            return err;
        }
        else {
            console.log("==== Retrieved user from database ====");
            console.log("==== Fields[0]: " + fields[0] + " ====");
            console.log("==== Rows[0]: " + rows[0] + " ====");
            console.log("==== Retrieved user ID: " + rows[0].user_id + " ====");
            console.log("==== Retrieved username: " + rows[0].username + " ====");
            return rows.username;
        }
    });
}

module.exports.createConnectionToDB = createConnectionToDB;
module.exports.checkInvalidInput = checkInvalidInput;
module.exports.registerNewUser = registerNewUser;
module.exports.signIn = signIn;


//db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')', function(err, rows, fields) {
//    if (err) {
//        console.log("throwing error");
//        throw err;
//    }
//    else {
//        console.log("User successfully recorded in database");
//    }
//});
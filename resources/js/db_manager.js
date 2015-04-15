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

var registerNewUser = function(db_conn, username, password, email, callback) {
    console.log("password inside registerNewUser: " + password);
    var hashed_password = generateNewHash(password);
    db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + hashed_password + '\', \'' + email + '\')', function(err, rows, fields) {
        if (err) {
            callback(err, false);
        }
        else {
            callback(null, true);
        }
    });
}

var signIn = function(db_conn, username, callback) {
    db_conn.query('SELECT * FROM users where username=\'' + username + '\' LIMIT 1', function(err, rows, fields) {
        if(err) {
            callback(err, null);
        }
        else {
            console.log("==== Retrieved user from database ====");
            console.log("==== Fields[0]: " + fields[0] + " ====");
            console.log("==== Rows[0]: " + rows[0] + " ====");
            console.log("==== Retrieved user ID: " + rows[0].user_id + " ====");
            console.log("==== Retrieved username: " + rows[0].username + " ====");
            console.log("==== Retrieved password: " + rows[0].password + " ====");
            callback(null, rows[0].password);
        }
    });
}

var generateNewHash = function(password_to_hash) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password_to_hash, salt);
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
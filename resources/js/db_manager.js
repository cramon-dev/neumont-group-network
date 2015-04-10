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
    
    console.log("Calling connect function");
    db_conn.connect();
    
    console.log("Returning connection: " + db_conn);
    return(db_conn);
}

var checkPotentialMaliciousInput = function(input_string) {
    //If input contains any scripts, kick them back to register
    //Does not currently protect against SQL injection
    if(input_string.indexOf('<script') > -1) {
        console.log("Malicious content found");
        throw {
            name: "InvalidInputException",
            message: "Invalid input."
        };
    }
    else {
        console.log("Returning " + input_string);
        return input_string;
    }
}

var registerNewUser = function(db_conn, username, password, email) {
    console.log("Inserting user into database");
    console.log('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')');
    db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')', function(err, rows, fields) {
        if (err) {
            throw err;
        }
        else {
            console.log("User successfully recorded in database");
        }
    });
}

var signIn = function(db_conn, username, password) {
    db_conn.query('SELECT * FROM users where username=\'' + username + '\' and password=\'' + password + '\'', function(err, rows, fields) {
        if (err) {
            throw err;
        }
        else {
            console.log("==== Retrieved user from database ====");
            console.log("==== Fields[0]: " + fields[0] + "====");
            console.log("==== Rows[0]: " + rows[0] + "====");
            console.log("==== Retrieved user ID: " + rows[0].user_id + "====");
            console.log("==== Retrieved username: " + rows[0].username + "====");
            return rows.username;
        }
    });
}

module.exports.createConnectionToDB = createConnectionToDB;
module.exports.checkPotentialMaliciousInput = checkPotentialMaliciousInput;
module.exports.registerNewUser = registerNewUser;
module.exports.signIn = signIn;
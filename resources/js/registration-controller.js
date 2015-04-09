var http = require('http');
var mysql = require('mysql');
//Will I need to use crypto here?
//var crypto = require('crypto');

//var DB = db.DB;
//var BaseRow = db.Row;
//var BaseTable = db.Table;

//DAILY REMINDER TO SANITIZE ANY USER INPUT BEFORE CREATING A QUERY

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

var insertIntoDB = function(db_conn, username, password, email) {
    console.log("Inserting user into database");
    console.log('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')');
    db_conn.query('INSERT INTO `users`(`username`, `password`, `email`) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\')', function(err, rows, fields) {
        if (err) {
            throw err;
        }
    });
    console.log("User successfully recorded in database");
}

module.exports.createConnectionToDB = createConnectionToDB;
module.exports.insertIntoDB = insertIntoDB;
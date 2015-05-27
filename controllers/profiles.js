var express = require('express');
var router = express.Router();
var util = require('util');
var fs = require('fs');
var user = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');


//Show a user's basic information
router.get(/^\/(\d+)\/?$/, function(req, res, next) {
    var requestedUserId = req.params[0];
    
    user.getSingleUserDetails(requestedUserId, function(err, userDetails) {
        if(!err && userDetails) {
            res.render('profile', { userDetails: userDetails });
        }
        else {
            req.session.errorMessage = err.message;
            res.redirect('/');
        }
    });
});

//Get form to edit user settings
router.get('/edit', function(req, res, next) {
    res.render('edit-user-settings');
});

//Make changes to user settings
router.post('/edit', function(req, res, next) {
    var userId = req.session.user.userId;
    var newPassword = req.body.newPassword;
    var newEmail = req.body.newEmail;
    var inputError = inputValidator.validateInput([ newPassword, newEmail ]);
    
    if(!inputError) {
        user.editUserDetails(newPassword, newEmail, userId, function(err, result) {
            if(!err) {
                if(result) {
                    req.session.message = 'User settings successfully updated';
                    res.redirect('/');
                }
                else {
                    res.render('edit-user-settings', { errorMessage: 'User details not updated, try again' });
                }
            }
            else {
                res.render('edit-user-settings', { errorMessage: err.message });
            }
        });
    }
    else {
        res.render('edit-user-settings', { errorMessage: inputError.message });
    }
});

router.get('/delete', function(req, res, next) {
    var userId = req.session.user.userId;
    
    user.deleteUser(userId, function(err, result) {
        if(!err) {
            if(result) {
                req.session.destroy(function(err) {
                    if(!err) {
                        res.render('index', { message: 'Your account has been deleted, we\'re sorry to see you go' });
                    }
                    else {
                        throw err;
                    }
                });
            }
            else {
                req.session.errorMessage = 'Error deleting account, please try again';
                res.redirect('/');
            }
        }
        else {
            req.session.errorMessage = err.message;
            res.redirect('/');
        }
    });
});

router.post('/upload', function(req, res, next) {
//    console.log('Request busboy: ' + req.busboy);
//    console.log('Request busboy file: ' + req.busboy.userAvatar);
//    var fstream;
//    req.pipe(req.busboy);
//    req.busboy.on('file', function (fieldname, file, filename) {
//        console.log("Uploading: " + filename); 
//        fstream = fs.createWriteStream(__dirname + '/uploads/' + filename);
//        file.pipe(fstream);
//        fstream.on('close', function () {
//            res.send('success uploading');
//            res.redirect('/');
//        });
//    });  
    if (req.files) { 
		console.log(util.inspect(req.files));
		if (req.files.size === 0) {
            return next(new Error("Select a file?"));
		}
		fs.exists(req.files.userAvatar.path, function(exists) { 
			if(exists) {
                user.changeAvatar(req.session.user.userId, req.files.userAvatar.name, function(err, result) {
                    if(!err) {
                        req.session.message = 'Changed your avatar';
                        res.redirect('/');
                    }
                    else {
                        req.session.message = 'Something went wrong changing your avatar';
                        res.redirect('/profiles/edit');
                    }
                });
                
//				res.end("Got your file!"); 
			} 
            else {
                req.session.errorMessage = 'Your file doesn\'t exist';
                res.redirect('/');
//				res.end("Doesn't exist."); 
			} 
		}); 
	} 
});

module.exports = router;

// Make sure we're posting as 'multipart/form-data'
//console.dir(req.headers['content-type']);
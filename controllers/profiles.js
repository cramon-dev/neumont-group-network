var express = require('express');
var router = express.Router();
var util = require('util');
var fs = require('fs');
var userModel = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');


// //Show a user's basic information
// router.get(/^\/(\d+)\/?$/, function(req, res, next) {
//     var requestedUserId = req.params[0];
    
//     userModel.getSingleUserDetails(requestedUserId, function(err, userDetails) {
//         if(!err && userDetails) {
//             res.render('profile', { userDetails: userDetails });
//         }
//         else {
//             req.session.errorMessage = err.message;
//             res.redirect('/');
//         }
//     });
// });

//Get form to edit user settings
router.get('/edit', function(req, res, next) {
    res.render('edit-user-settings', { user: req.session.user });
});

//Make changes to user settings
router.post('/edit', function(req, res, next) {
    var userId = req.session.user.userId;
    var newPassword = req.body.newPassword;
    var newEmail = req.body.newEmail;
    var inputError = inputValidator.validateInput([ newPassword, newEmail ]);
    
    if(!inputError) {
        userModel.editUserDetails(newPassword, newEmail, userId, function(err, result) {
            if(!err) {
                if(result) {
                    req.session.message = 'User settings successfully updated.';
                    res.redirect('/');
                }
                else {
                    res.render('edit-user-settings', { errorMessage: 'User details not updated, try again.' });
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
    
    userModel.deleteUser(userId, function(err, result) {
        if(!err) {
            if(result) {
                req.session.destroy(function(err) {
                    if(!err) {
                        res.render('index', { message: 'Your account has been deleted. We\'re sorry to see you go.' });
                    }
                    else {
                        throw err;
                    }
                });
            }
            else {
                req.session.errorMessage = 'Error deleting account, please try again.';
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
    if (req.files) { 
		if (req.files.size === 0) {
            return next(new Error("Select a file?"));
		}
        
        console.log('User Image Path: ' + req.files.userAvatar.path);
        console.log('User Image Name: ' + req.files.userAvatar.name);
		fs.exists(req.files.userAvatar.path, function(exists) { 
			if(exists) {
                userModel.changeAvatar(req.session.user.userId, req.files.userAvatar.name, function(err, result) {
                    if(!err) {
                        req.session.user.userAvatar = '../' + req.files.userAvatar.name;
                        req.session.message = 'You changed your avatar.';
                        res.redirect('/');
                    }
                    else {
                        req.session.message = 'Something went wrong changing your avatar.';
                        res.redirect('/profiles/edit');
                    }
                });
			} 
            else {
                req.session.errorMessage = 'Your file doesn\'t exist.';
                res.redirect('/');
			} 
		});
	}
});

module.exports = router;

// Make sure we're posting as 'multipart/form-data'
//console.dir(req.headers['content-type']);
var express = require('express');
var router = express.Router();
var user = require('../models/user.js');
var inputValidator = require('../models/input-validator.js');

//router.get(/^\/(\d+)\/?$/, function(req, res, next) {
//    var userId = req.params[0];
//    
//    
//});

router.get('/edit', function(req, res, next) {
    res.render('edit-user-settings');
});

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

module.exports = router;
var express = require('express');
var url = require('url');
var router = express.Router();
var searchModel = require('../models/search-model.js');
var inputValidator = require('../models/input-validator.js');

router.get('/', function(req, res, next) {
    var keywords = [];
    var query = req.query;
    for(var propName in query) {
        var propValue = query[propName];
        keywords.push(propValue);
    }
    var inputError = inputValidator.validateInput(keywords);
    
    if(!inputError) {
        searchModel.getListOfOrgsByKeywords(keywords, function(err, searchResults) {
            if(!err) {
                res.render('search-results', { searchResults: searchResults });
            }
            else {
                res.render('search-results', { errorMessage: err.message });
            }
        });
    }
    else {
        res.render('home', { errorMessage: inputError.message });
    }
});

module.exports = router;
var express = require('express');
var url = require('url');
var router = express.Router();
var searchModel = require('../models/search-result.js');
var inputValidator = require('../models/input-validator.js');

router.get('/', function(req, res, next) {
    var keywords = [];
    var query = req.query;
    for(var propName in query) {
        var propValue = query[propName];
        keywords.push(propValue);
    }
    var inputError = inputValidator.validateInput(keywords);
    
    console.log('Keywords length: ' + keywords.length);
    if(!inputError) {
        if(keywords.length === 1) {
            searchModel.getListOfOrgsByOneKeyword(keywords, function(err, searchResults) {
                if(!err) {
                    for(var propName in searchResults) {
                        var propValue = searchResults[propName];
                        console.log('Key: ' + propName + ', Value: ' + propValue);
                    }
//                    res.render('search-results', searchResults);
                    var newResults = [ { name: 'result 1' }, { name: 'result 2' }, { name: 'result 3' } ];
                    res.render('search-results', { locals: newResults });
                }
                else {
                    res.render('search-results', { errorMessage: err.message });
                }
            });
        }
        else if(keywords.length >= 2){
            searchModel.getListOfOrgsByMultipleKeywords(keywords, function(err, searchResults) {
                console.log('multiple keywords not supported yet');
            });
        }
    }
    else {
        //redirect to a blank search page that says 'invalid input'?
        res.render('search-results', { errorMessage: inputError.message });
    }
});

module.exports = router;
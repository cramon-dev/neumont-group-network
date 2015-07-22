var express = require('express');
var router = express.Router();
var util = require('util');
var q = require('q');


router.get('/', function(req, res, next) {
    q.fcall(func1)
    .then(func2)
    .then(function(value) {
        if(value) {
            console.log('got some data');
            res.send('Data received: ' + util.inspect(value));
        }
        else {
            res.send('No data received');
        }
    })
    .catch(function (err) {
        console.log('got an error');
        res.send(util.inspect(err));
    })
    .done();
});


var func1 = function() {
    console.log('func1');
}

var func2 = function() {
    console.log('func2');
    return { foo: 'foo', bar: 'bar', one: 1 };
}

var throwErr = function() {
    throw new Error('Throw an error');
}


module.exports = router;
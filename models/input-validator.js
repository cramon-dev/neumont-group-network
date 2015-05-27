//Check for potentially malicious input

exports.validateString = function(inputString) {
    if(inputString.match(/[~!#$%^&*='"(){}\[\]\\\/\<\>]/)) {
        var err = {
            name: "InvalidInputException",
            message: "Invalid input, please refrain from using prohibited characters"
        };

        return err;
    }
    
    return null;
}

//TODO:
//Capture '--' (SQL comment)

exports.validateInput = function(inputStringList) {
    for(string in inputStringList) {
        var item = inputStringList[string];
        //[~!#$%^&*='"(){}\[\]\\\/\<\>]/ || /\s*
        //[~!#$%^&*='"(){}\[\]\\\/\<\>] || (\s*)
        if(item.match(/[~!#$%^&*='"(){}\[\]\\\/\<\>]/ || /\s*/)) {
            console.log('Found a match for potentially malicious input');
            var err = {
                name: "InvalidInputException",
                message: "Invalid input, please refrain from using prohibited characters"
            };
            
            return err;
        }
    }
    
    return null;
}

exports.validateOrgAndEventInput = function(inputStringList) {
    for(string in inputStringList) {
        var item = inputStringList[string];
        if(item.match(/['"(){}\[\]\\\/\<\>]/)) {
            var err = {
                name: "InvalidInputException",
                message: "Invalid input, please refrain from using prohibited characters"
            };
            
            return err;
        }
    }
    
    return null;
}

//Encode UTF-8 string to Base64
exports.encodeString = function(string) {
//    return btoa(unescape(encodeURIComponent(string)));
    return new Buffer(string).toString('base64');
}

//Decode Base64 string to UTF-8
exports.decodeString = function(string) {
//    return decodeURIComponent(escape(atob(string)));
    return new Buffer(string, 'base64'); // Ta-da
}
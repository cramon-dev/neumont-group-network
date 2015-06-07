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
        //v1    [~!#$%^&*='"(){}\[\]\\\/\<\>] || /\s*
        //v1.1  [~!#$%^&*='"(){}\[\]\\\/\<\>] || (\s*)
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

exports.validateEmailAddress = function(inputString) {
    if(!inputString.match(/(\w+)\@(\w+\.)+(com|org|edu|mil|gov)/)) {
        var err = { 
            name: "InvalidEmailException",
            message: "Please supply a valid email address"
        };
        
        return err;
    }
}

exports.doPasswordsMatch = function(pass1, pass2) {
    return pass1 == pass2 ? true : false;
}

//Encode UTF-8 string to Base64
exports.encodeString = function(string) {
//    return btoa(unescape(encodeURIComponent(string)));
    return new Buffer(string).toString('base64');
}

//Decode Base64 string to UTF-8
exports.decodeString = function(string) {
//    return decodeURIComponent(escape(atob(string)));
    console.log('Decoding string: ' + string);
    return new Buffer(string, 'base64');
}
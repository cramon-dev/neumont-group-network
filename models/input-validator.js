//Check for potentially malicious input

exports.validateString = function(inputString) {
    if(inputString.match(/[~!#$%^&*='"(){}\[\]\\\/\<\>]/)) {
        var err = {
            name: "InvalidInputException",
            message: "Invalid input, please refrain from using prohibited characters."
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
                message: "Invalid input, please refrain from using prohibited characters."
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
                message: "Invalid input, please refrain from using prohibited characters."
            };
            
            return err;
        }
    }
    
    return null;
}
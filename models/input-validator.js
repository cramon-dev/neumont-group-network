//Check for potentially malicious input
exports.validateInput = function(inputStringList) {
    for(string in inputStringList) {
        var item = inputStringList[string]
        if(item.indexOf(/[~!@#$%^&*='"(){}\[\]\\\/\<\>]/) > -1) {
            var err = {
                name: "InvalidInputException",
                message: "Invalid input"
            };
            
            return err;
        }
    }
    
    return null;
}
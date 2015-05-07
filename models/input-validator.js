//Check for potentially malicious input
exports.validateInput = function(inputStringList) {
    for(string in inputStringList) {
        var item = inputStringList[string]
        if(item.match(/[~!#$%^&*='"(){}\[\]\\\/\<\>]/ || /\s*/)) {
            var err = {
                name: "InvalidInputException",
                message: "Invalid input, please refrain from using prohibited characters"
            };
            
            return err;
        }
    }
    
    return null;
}
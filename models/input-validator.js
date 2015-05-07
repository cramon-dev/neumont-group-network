//Check for potentially malicious input
exports.validateInput = function(inputStringList) {
    for(string in inputStringList) {
        if(inputStringList[string].indexOf(/[~!@#$%^&*='"(){}\[\]\\\/\<\>]/) > -1) {
//            inputStringList.push({ error: { name: "InvalidInput", message: "Invalid input detected" }});
            var err = {
                name: "InvalidInputException",
                message: "Invalid input"
            };
            
            return err;
        }
    }
    
    return null;
}
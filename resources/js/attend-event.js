//In the future I want to use an AJAX call to join an event/organization

var attendEvent = function(eventId) {
    console.log('javascript pls');
    var xmlhttp = new XMLHttpRequest();
    var path = 'http://localhost:3000/events/' + eventId + '/optin';
    xmlhttp.open('GET', path, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.status == 200) {
            document.getElementsByClassName('message').innerHTML = xmlhttp.responseText;
        }
        else if(xmlhttp.status == 500) {
            document.getElementsByClassName('errorMessage').innerHTML = xmlhttp.responseText;
        }
    }
    xmlhttp.send();
}
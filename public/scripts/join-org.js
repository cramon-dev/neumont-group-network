//Somehow implement joining/leaving an organization as an AJAX call?

function joinOrganization() {
    var xmlHttpRequest;
    .ajax("http://localhost:3000/organizations/#{organization_id}/join", {
        method: 'GET'
    }); 
}
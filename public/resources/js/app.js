var ngn = angular.module("messager", []);

ngn.service("UserService", function($http) {
	//just don't use this..
	var user = {};

	this.getUser = function() {
		console.log('Get user in UserService');
		if(!user) {
			return ;
		}
		else {
			return user;
		}
	}
});

	// this.initUser = function() {
	// 		console.log('Init user');
	// 		$http.get('http://localhost:3000/users').success(function(response) {
	// 			console.log('Success getting user');
	// 			console.log(response);
	// 			user = response;
	// 			return response;
	// 		})
	// 		.error(function(response) {
	// 			// Return a 401 Unauthorized?
	// 			console.log('Error when retrieving a user');
	// 			console.log(response);
	// 		});
	// 	}
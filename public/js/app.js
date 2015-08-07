var ngn = angular
	.module("messager", [])
	.service('UserService', function($http) {
		var user = {};

		this.setUser = function(userToSet) {
			user = userToSet;
		}

		this.getUser = function() {
			return user;
		}
	});
angular
	.module("messager")
	.service('MessageService', function($http) {
		this.getAllConversations = function(userId, token) {
			$http.get('http://localhost:3000/messages/:userId')
				.success(function(response) {
					console.log('Success getting messages');
					console.log(response);
				})
				.error(function(response) {
					// Return a 401 Unauthorized?
					console.log('Error when retrieving all conversations');
					console.log(response);
				});
		}
	})
	.controller("messageCtrl", function($scope, UserService, MessageService) {
		$scope.user = UserService.getUser();

		$scope.getAllConversations = function() {
			MessageService.getAllConversations(1, 'kjsa;lkfjajelwqoiuewoiruewrewqoij');
		};

		$scope.initUser = function() {
			$scope.user = { username: 'cramon' };
		};
	});
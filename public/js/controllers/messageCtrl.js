angular
	.module("messager")
	.service('MessageService', function($http) {
		this.getAllConversations = function(userId) {
			console.log('User ID for messages: ' + userId);
			$http.get('http://localhost:3000/messages/:userId')
				.success(function(response) {
					console.log('Success getting messages');
					console.log(response);
					return response;
				})
				.error(function(response) {
					// Return a 401 Unauthorized?
					console.log('Error when retrieving all conversations');
					console.log(response);
				});
		}
	})
	.controller("messageCtrl", function($scope, MessageService, UserService) {
		$scope.user = {};

		$scope.getUser = function() {
			return $scope.user;
		};

		$scope.setUser = function(userToSet) {
			$scope.user = userToSet;
			UserService.setUser($scope.user);
		};

		$scope.getAllConversations = function() {
			console.log('Get all conversations');
			$scope.conversations = MessageService.getAllConversations($scope.user.userId);
			// MessageService.getAllConversations(userId, ??)
			// MessageService.getAllConversations(1, 'kjsa;lkfjajelwqoiuewoiruewrewqoij');
		};

		$scope.sendMessage = function(message) {
			var messageToSend = $scope.encodeString(message);
			console.log('Message to send encoded: ' + messageToSend);
			// MessageService.sendMessage(senderId, receiverId, message);
		};

		//Encode UTF-8 string to Base64
		$scope.encodeString = function(string) {
		    return new Buffer(string).toString('base64');
		}

		//Decode Base64 string to UTF-8
		$scope.decodeString = function(string) {
		    return new Buffer(string, 'base64');
		}
	});
angular
	.module("messager")
	.service("MessageService", function($http) {
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

		this.sendMessage = function(senderId, receiverId, message) {
			console.log('Send message');
		}

		//Encode UTF-8 string to Base64
		this.encodeString = function(string) {
		    return new Buffer(string).toString('base64');
		}

		//Decode Base64 string to UTF-8
		this.decodeString = function(string) {
		    return new Buffer(string, 'base64');
		}
	})
	.controller("messageCtrl", function($scope, $http, $log, MessageService, UserService) {
		$scope.windowMode = 'list'; // when window mode = list, show list of conversations, when window mode = convo, show conversation with someone
		$scope.user;
		// $scope.conversations = [
		// 	{ userMessaging: 'cramon', userMessagingImg: '/resources/img/default_user_avatar.png' },
		// 	{ userMessaging: 'kreed', userMessagingImg: '/resources/img/default_user_avatar.png' },
		// 	{ userMessaging: 'zosullivan', userMessagingImg: '/resources/img/default_user_avatar.png' }
		// ];

		$scope.something = function() {
			$log.warn('something');
		};

		$scope.getUser = function() {
			return $scope.user;
		};

		$scope.initUser = function() {
			console.log('Initialize user');
			$http.get('http://localhost:3000/users').success(function(data) {
				console.log('Success getting user');
				console.log(data);
				$scope.user = data;
				$scope.getAllConversations();
			})
			.error(function(response) {
				console.log('Error getting user');
				console.log(response);
			});;

			for(var i in $scope.user) {
				console.log('Key: ' + i + '\nValue: ' + $scope.user[i]);
			}
		}

		$scope.getAllConversations = function() {
			console.log('Get all conversations');
			$scope.conversations = MessageService.getAllConversations($scope.user.userId);
			// MessageService.getAllConversations(userId, ??)
			// MessageService.getAllConversations(1, 'kjsa;lkfjajelwqoiuewoiruewrewqoij');
		};

		$scope.selectConversation = function(conversation) {
			console.log('Select conversation');
			$scope.windowMode = 'convo';
			for(var i in conversation) {
				console.log('Key: ' + i + '\nValue: ' + conversation[i]);
			}
		};

		$scope.sendMessage = function(message) {
			var messageToSend = $scope.encodeString(message);
			console.log('Message to send encoded: ' + messageToSend);
			// MessageService.sendMessage(senderId, receiverId, message);
		};
	});
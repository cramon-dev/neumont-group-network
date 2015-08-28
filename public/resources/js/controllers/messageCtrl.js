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
			$http.post('http://localhost:3000/messages/send/' + receiverId, { senderId: senderId, message: message })
				.success(function(response) {
					console.log('Success sending message');
					return response;
				})
				.error(function(response) {
					console.log('Error sending message');
					console.log(response);
				});
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
		$scope.currentConversation = { receiverId: 1 };
		$scope.conversations = [
			{ userMessaging: 'testuser2', userMessagingImg: '/resources/img/default_user_avatar.png', receiverId: 3 },
			{ userMessaging: 'testuser3', userMessagingImg: '/resources/img/default_user_avatar.png', receiverId: 2 }
		];


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
			// $scope.conversations = MessageService.getAllConversations($scope.user.userId);
			// MessageService.getAllConversations(userId, ??)
			// MessageService.getAllConversations(1, 'kjsa;lkfjajelwqoiuewoiruewrewqoij');
		};

		$scope.selectConversation = function(conversation) {
			console.log('Select conversation');
			$scope.currentConversation = conversation;
			$scope.windowMode = 'convo';
			for(var i in conversation) {
				console.log('Key: ' + i + '\nValue: ' + conversation[i]);
			}
		};

		$scope.returnToList = function() {
			$scope.currentConversation = {};
			$scope.windowMode = 'list';
		}

		$scope.sendMessage = function(message) {
			console.log('Message to send: ' + message);
			console.log('Receiver ID: ' + $scope.currentConversation.receiverId);
			console.log('Sender ID: ' + $scope.user.userId);

			MessageService.sendMessage($scope.user.userId, $scope.currentConversation.receiverId, message);
			// MessageService.sendMessage(senderId, receiverId, message);
		};
	});
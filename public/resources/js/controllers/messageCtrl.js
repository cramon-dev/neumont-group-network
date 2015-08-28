angular
	.module("messager")
	.service("MessageService", function($http) {
		this.getAllConversations = function(userId) {
			console.log('User ID for messages: ' + userId);
			$http.get('http://localhost:3000/messages/:userId')
				.success(function(response) {
					console.log('Success getting messages');
					console.log(response);

					// for(var i in response) {
					// 	for(var j in response[i]) {
					// 		if(j == 'content') {
					// 			console.log('Found content key');
					// 			response[i][j].content = decodeString(response[i][j].content);
					// 			console.log('Content after decoding..' + response[i][j].content);
					// 		}
					// 		console.log('Key: ' + j + '\nValue: ' + response[i][j]);
					// 	}
						
					// }
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
					alert('Your message has been sent!');
					return response;
				})
				.error(function(response) {
					alert('Error: your message could not be sent.');
					console.log(response);
				});
		}

		this.sendNewMessage = function(senderId, userToSendTo, message) {
			$http.post('http://localhost:3000/messages/send/user/' + userToSendTo, { senderId: senderId, message: message })
				.success(function(response) {
					alert('Your message has been sent!');
					return response;
				})
				.error(function(response) {
					alert('Error: your message could not be sent.');
					console.log(response);
					alert(response);
				});
		}

		//Encode UTF-8 string to Base64
		this.encodeString = function(string) {
		   return btoa(unescape(encodeURIComponent(string)));
		    // return new Buffer(string).toString('base64');
		}

		//Decode Base64 string to UTF-8
		var decodeString = function(string) {
		   return decodeURIComponent(escape(atob(string)));
		    // return new Buffer(string, 'base64'); // Ta-da
		}

	})
	.controller("messageCtrl", function($scope, $http, $log, MessageService, UserService) {
		$scope.windowMode = 'list'; // when window mode = list, show list of conversations, when window mode = convo, show conversation with someone
		$scope.user;
		$scope.currentConversation = {  };
		// $scope.conversations = [
		// 	{ userMessaging: 'testuser2', userMessagingImg: '/resources/img/default_user_avatar.png', receiverId: 3 },
		// 	{ userMessaging: 'testuser3', userMessagingImg: '/resources/img/default_user_avatar.png', receiverId: 2 }
		// ];


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

		$scope.formatConversations = function() {
			for(var i in $scope.conversations) {
				if(i == 'content') {
					console.log('Found content key');
					$scope.conversations[i].content = MessageService.decodeString($scope.conversations[i].content);
					console.log('Content after decoding..' + $scope.conversations[i].content);
				}
				console.log('Key: ' + i + '\nValue: ' + $scope.conversations[i]);
			}
		};

		$scope.getAllConversations = function() {
			console.log('Get all conversations');
			// $scope.conversations = MessageService.getAllConversations($scope.user.userId);
			$http.get('http://localhost:3000/messages/:userId')
				.success(function(response) {
					console.log('Success getting messages');
					console.log(response);
					$scope.conversations = response;
				})
				.error(function(response) {
					// Return a 401 Unauthorized?
					console.log('Error when retrieving all conversations');
					console.log(response);
				});
			// $scope.formatConversations();
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

		// Alters window view

		$scope.composeMessage = function() {
			$scope.currentConversation = {};
			$scope.windowMode = 'newMessage';
		};

		

		$scope.returnToList = function() {
			$scope.currentConversation = {};
			$scope.windowMode = 'list';
		};


		// Sends messages

		$scope.sendMessage = function(message) {
			console.log('Message to send: ' + message);
			console.log('Receiver ID: ' + $scope.currentConversation.receiver_id);
			console.log('Sender ID: ' + $scope.user.userId);

			MessageService.sendMessage($scope.user.userId, $scope.currentConversation.receiver_id, message);
			$scope.refresh();
			// MessageService.sendMessage(senderId, receiverId, message);
		};

		$scope.sendNewMessage = function(userToSendTo, message) {
			MessageService.sendNewMessage($scope.user.userId, userToSendTo, message);
			$scope.refresh();
		};

		$scope.refresh = function() {
			$scope.getAllConversations();
		};
	});
// setting up the module with ui-router
var app = angular.module('newsApp', ['ui.router']);

// setting up states in this config block
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {				// home state
			url:'/home',
			templateUrl: '/home.html',
			controller: 'MainController',
			resolve: {					// ensures posts are loaded
				postPromise: ['posts', function(posts){
					return posts.getAll();
				}]
			}
		});

		.state('posts', {				// posts state
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsController',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		});

		.state('login', {				// login state
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		})

		.state('register', {			// registeration state
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthController',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		});

		$urlRouterProvider.otherwise('home');	// for unspecified routes
	}
]);

// posts service (for handling view of posts)
app.factory('posts', ['$http', 'auth', function($http, auth){
	var p = {
		posts: []
	};

	// returns the post service itself
	p.getAll = function() {
		return $http.get('/posts').success(function(data){
			angular.copy(data, p.posts);	// deep copy of returned data
											// ensures new data reflected in view
		});
	};

	// creates a post
	p.create = function(post) {
		return $http.post('/posts', post, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			p.posts.push(data);
		});
	};

	// upvotes a post
	p.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			post.upvotes += 1;
		});
	};

	// retrieves a single post from the server
	p.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	};


	//add comment to a post
	p.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		});
	};

	//upvote comments in a particular post
	p.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			comment.upvotes += 1;
		});
	};

	return p;
}]);

// authentication service
app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	// sets a token into localStorage
	auth.saveToken = function (token){
		$window.localStorage['newnews-news-token'] = token;
	};

	// gets a token
	auth.getToken = function (){
		return $window.localStorage['newnews-news-token'];
	}

	// returns true iff user is logged in
	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	// returns the username of the current logged in user
	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	// posts user to /register route and saves the token returned
	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	// posts user to login route and save the token returned
	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	// removes the user's token from localStorage, logging them out
	auth.logOut = function(){
		$window.localStorage.removeItem('newnews-news-token');
	};

	return auth;
}]);



// controller for the home state
app.controller('MainController', [
	'$scope',
	'posts',	// injecting the 'posts' factory service
	function($scope, posts){
		// list of posts with title and upvotes elements
		$scope.posts = posts.posts;
		$scope.isLoggedIn = auth.isLoggedIn;

		$scope.addPost = function(){
			// add a post iff the title exists and is non-empty
			if(!$scope.title || $scope.title === '') { return; }
			posts.create({			// created posts get saved to server
				title: $scope.title,
				link: $scope.link,
			});
			$scope.title='';
			$scope.link='';
		};

		// function to increase upvotes; requires a post element
		$scope.incrementUpvotes = function(post) {
			posts.upvote(post);
		};
	}
]);

// controller for the posts state
app.controller('PostsController', [
	'$scope',
	'$stateParams',
	'posts',	// dependency injection of 'posts' service
	'post',		// dependency injection of a single retrieved post
	function($scope, posts, post) {
		// list of posts with an id
		$scope.posts = post;
		$scope.isLoggedIn = auth.isLoggedIn;

		// adds a comment to post iff it is non-empty
		$scope.addComment = function(){
			if($scope.body === '') { return; }
			posts.addComment(post._id, {	// uses the addComment of the injected posts service
				body: $scope.body,
				author: 'user',
			}).success(function(comment) {
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		};

		// enable upvoting of comments
		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		};
	}
]);

// controller for the login and register page
app.controller('AuthController', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
		$scope.user = {};

		// registers a user by calling the auth service
		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		// lets a user log in by calling auth service
		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
	}
]);

// controller for the navigation bar
app.controller('NavController', [
	'$scope',
	'auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);


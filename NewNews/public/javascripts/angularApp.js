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

		$urlRouterProvider.otherwise('home');	// for unspecified routes
	}
]);

// posts service (for handling view of posts)
app.factory('posts', ['$http', function($http){
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
		return $http.post('/posts', post).success(function(data){
			p.posts.push(data);
		});
	};

	// upvotes a post
	p.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data){
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
		return $http.post('/posts/' + id + '/comments', comment);
	};

	//upvote comments in a particular post
	p.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
		.success(function(data){
			comment.upvotes += 1;
		});
	};

	return p;
}]);

// controller for the home state
app.controller('MainController', [
	'$scope',
	'posts',	// injecting the 'posts' factory service
	function($scope, posts){
		// list of posts with title and upvotes elements
		$scope.posts = posts.posts;

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

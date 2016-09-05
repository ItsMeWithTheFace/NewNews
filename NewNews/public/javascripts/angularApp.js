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
			controller: 'PostsController'
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
			$scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
				// mock comment data to check if routing works
				comments: [
					{author: 'Billy', body: 'Nice', upvotes: 0},
					{author: 'Jimmy', body: 'Good work', upvotes: 0}
				]
			});
			$scope.title='';
			$scope.link='';
		};

		// function to increase upvotes; requires a post element
		$scope.incrementUpvotes = function(post) {
			post.upvotes += 1;
		};
	}
]);

// controller for the posts state
app.controller('PostsController', [
	'$scope',
	'$stateParams',
	'posts',	// dependency injection of 'posts' service
	function($scope, $stateParams, posts) {
		// list of posts with an id from stateParams
		$scope.posts = posts.posts[$stateParams.id];

		// adds a comment to post iff it is non-empty
		$scope.addComment = function(){
			if($scope.body === '') { return; }
			$scope.post.coments.push({
				body: $scope.body,
				author: 'user',
				upvotes: 0
			});
			$scope.body = '';
		};
	}
]);

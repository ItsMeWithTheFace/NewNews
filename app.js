// setting up the module with ui-router
var app = angular.module('newsApp', []);
angular.module('newsApp', ['ui.router'])

// setting up states in this config block
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {				// home state
			url:'/home',
			templateUrl: '/home.html',
			controller: 'MainController'
		});

		.state('posts', {				// posts state
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsController'
		});

		$urlRouterProvider.otherwise('home');	// for unspecified routes
	}
]);

// factory to hold post elements 
app.factory('posts', [function(){
	var p = {
		posts: []
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
		$scope.posts = posts.posts[$stateParams.id];
	}
]);

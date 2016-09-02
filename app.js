// setting up the module
var app = angular.module('newsApp', []);

// factory to hold post elements 
app.factory('posts', [function(){
	var p = {
		posts: []
	};
	return p;
}]);

// creating a new controller
app.controller('MainController', [
	'$scope',
	// injecting the factory service
	'posts',
	function($scope, posts){
		// list of posts with title and upvotes elements
		$scope.posts = posts.posts;

		$scope.addPost = function(){
			// add a post iff the title exists and is non-empty
			if(!$scope.title || $scope.title === '') { return; }
			$scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0});
			$scope.title='';
			$scope.link='';
		};

		// function to increase upvotes; requires a post element
		$scope.incrementUpvotes = function(post) {
			post.upvotes += 1;
		};
	}
	]);
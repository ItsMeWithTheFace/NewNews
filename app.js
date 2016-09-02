// setting up the module
var app = angular.module('newsApp', []);

// creating a new controller
app.controller('MainController', 
	['$scope', 
	function($scope){
		// list of posts with title and upvotes elements
		$scope.posts = [
			{title: 'post 1', upvotes: 5},
			{title: 'post 2', upvotes: 2},
			{title: 'post 3', upvotes: 6},
			{title: 'post 4', upvotes: 10},
			{title: 'post 5', upvotes: 21}
			];

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
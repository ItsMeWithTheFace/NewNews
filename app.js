var app = angular.module('newsApp', []);

app.controller('MainController', 
	['$scope', 
	function($scope){
		$scope.test = 'Hello World'
		$scope.posts = [
						{title: 'post 1', upvotes: 5},
						{title: 'post 2', upvotes: 2},
						{title: 'post 3', upvotes: 6},
						{title: 'post 4', upvotes: 10},
						{title: 'post 5', upvotes: 21}
						];
					}
	]);
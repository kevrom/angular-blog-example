'use strict';
/* global angular */

require('angular/angular');
require('restangular');

var app = angular.module('blogtest', [require('angular-ui-router'), 'restangular']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider',
	function ($stateProvider, $urlRouterProvider, $locationProvider, $RestangularProvider) {
		console.log('this is running');
		$RestangularProvider.setBaseUrl('/api');

		$locationProvider.html5Mode(true).hashPrefix('!');
		$urlRouterProvider.when('', '/');
		$stateProvider
			.state('blog', {
				url: '/',
				views: {
					'blog@': {
						controller: 'BlogCtrl',
						templateUrl: '/partials/blog.html'
					}
				},
				resolve: {
					blog: ['Restangular', function(Restangular) {
						return Restangular.restangularizeElement(null, {}, 'blogs');
					}],
					blogs: ['BlogSrv', function(BlogSrv) {
						return BlogSrv.getList();
					}]
				}
			})
			.state('blog.create', {
				url: 'new',
				views: {
					'blog@': {
						controller: 'BlogCtrl',
						templateUrl: '/partials/blog.create.html'
					}
				}
			})
			.state('blog.view', {
				url: ':id',
				views: {
					'blog@': {
						controller: 'BlogCtrl',
						templateUrl: '/partials/blog.view.html',
					}
				},
				resolve: {
					blog: ['BlogSrv', '$stateParams', function(BlogSrv, $stateParams) {
						return BlogSrv.one($stateParams.id);
					}]
				}
			})
			.state('blog.view.update', {
				url: ':id/edit',
				views: {
					'blog@': {
						controller: 'BlogCtrl',
						templateUrl: '/partials/blog.view.update.html',
					}
				}
			});
}]);

app.factory('BlogSrv', ['Restangular', function(Restangular) {
	return Restangular.service('blogs');
}]);

app.controller('BlogCtrl', ['blog', 'blogs', '$scope', '$state',
	function(blog, blogs, $scope, $state) {
		$scope.blog = blog;
		$scope.blogs = blogs;

		$scope.save = function(blog) {
			blog.save().then(function(res) {
				$state.go('blog.view', { id: res.id });
			});
		};
	}
]);


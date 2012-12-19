define(['controller','text!html/projects.html'], function(Controller,Template){
	return Controller.extend({
		init: function() {
			log('ProjectsController > init');
			var that = this;

			$module.directive('projectlist', function(){
				return {
					restrict: 'E',
					replace: true,
					scope: true,
					template: '<div class="project" title="Double-click to edit" edit-project ng-repeat="project in category.projects" data-projectid="{{project.id}}">'+
							'<div class="name">Name : {{project.name}}</div>'+
							'<div class="accounting">Accounting : {{project.accounting.name}}</div>'+
						'</div>'
				};
			}).directive('editProject', function(){
				return that.editProject;
			}).directive('catDblclick', function(){
				return that.catDblclick;
			});

			$module.controller('CategoriesController', ['$scope','$resource',that.categoriesController]);
		},
		render: function() {
			log('ProjectsController > render');
			$container.empty().append(Template);

			angular.bootstrap(document.getElementById('categories'), ['timesheet']);
		},
		categoriesController: function($scope, $resource){

			var Categories = $resource('/categories');
			$scope.categories = Categories.query();
		},
		editProject: function(scope, element, attrs) {
			element.ready(function(){
				element.dblclick(function(){
					log('project dblclick');
				});
			});
		},
		catDblclick: function(scope, element, attrs) {
			element.ready(function(){
				element.dblclick(function(){
					log('cat dblclick');
				});
			});
		}
	});
});
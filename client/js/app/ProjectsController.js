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
			}).factory('$openModalCatProject', function(){
				return that.openModalCatProject;
			});

			$module.controller('CategoriesController', ['$scope','$resource','$openModalCatProject',that.categoriesController]);
		},
		render: function() {
			log('ProjectsController > render');
			$container.empty().append(Template);

			angular.bootstrap(document.getElementById('categories'), ['timesheet']);
		},
		categoriesController: function($scope, $resource,$openModalCatProject){
			$scope.$openModalCatProject = $openModalCatProject;
			var Categories = $resource('/categories');
			$scope.categories = Categories.query();
		},
		editProject: function(scope, element, attrs) {
			element.ready(function(){
				element.dblclick(function(){
					var pid = $(this).attr('data-projectId');
					var cid = $(this).closest('li').find('.title').attr('data-catid');
					scope.$openModalCatProject(scope, cid, pid );
				});
			});
		},
		catDblclick: function(scope, element, attrs) {
			element.ready(function(){
				element.dblclick(function(){
					scope.$openModalCatProject(scope, $(this).attr('data-catId'), undefined);
				});
			});
		},
		openModalCatProject: function($scope, catid, projectid){
			if (catid && projectid) {
				log("Edit project "+catid+"-"+projectid);
				$scope.title="Edit a project";
			} else if (catid && projectid == undefined){
				log("Edit category "+catid);
				$scope.title="Edit a category";
			} else if (catid == undefined) {
				log("New category");
				$scope.title="Create a new category";
			} if (catid && projectid == -1) {
				log("New project");
				$scope.title="Create a new project";
			}
			$("#myModal").reveal();
		}
	});
});
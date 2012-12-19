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
					template: '<div class="project" edit-project ng-repeat="project in category.projects" data-projectid="{{project.id}}">'+
							'<div class="name">Name : {{project.name}}</div>'+
							'<div class="accounting">Accounting : {{project.accounting.name}}</div>'+
								'<div class="options" style="display:none">' +
									'<span class="button tiny secondary round icon-edit has-tip tip-bottom" data-width="90" title="Edit this project."></span><span class="button alert tiny round icon-delete has-tip tip-bottom" data-width="90" title="Delete this project."></span>' +
								'</div>'+
						'</div>'
				};
			}).directive('editProject', function(){
				return that.editProject;
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
				var timeout;
				var $options = element.find('.options');
				element.on({
						mouseenter:function(event){
							timeout = setTimeout(function(){
								$options.fadeIn();
							},500);
						},
						mouseleave:function(event){
							clearTimeout(timeout);
							$options.fadeOut();
						}
					}
				);
			});
		}
	});
});
define(['controller','text!html/projects.html'], function(Controller,Template){
	return Controller.extend({
		init: function() {
			log('ProjectsController > init');

			var that = this;
			var $template = $(Template);
			that.mainTemplate = $template.find('#main-template').html();
			that.projectTemplate = $template.find('#project-template').html();


			$module.directive('projectlist', function(){
				return {
					restrict: 'E',
					replace: true,
					scope: true,
					template: that.projectTemplate
				};
			}).directive('editProject', function(){
				return that.editProject;
			}).directive('catDblclick', function(){
				return that.catDblclick;
			});
            $module.config(function($httpProvider){
                $httpProvider.defaults.headers.patch = $httpProvider.defaults.headers.post;
            });

			$module.controller('ProjectsController', ['$scope',that.projectsController]);
			$module.controller('CategoriesController', ['$rootScope','$scope','$resource','$compile','$timeout',that.categoriesController]);
		},
		render: function() {
			log('ProjectsController > render');
			$container.empty().append(this.mainTemplate);

			angular.bootstrap(document.getElementById('categories'), ['timesheet']);
		},
		projectsController: function($scope) {

		},
		categoriesController: function($rootScope,$scope, $resource,$compile,$timeout){
			var Categories = $resource('/categories');
			$scope.categories = Categories.query();

			$scope.openModalCatProject = function($scope, catid, projectid){
				$rootScope.hideAccounting = true;
				if (catid && projectid) {
					log("Edit project "+catid+"-"+projectid);
					$rootScope.title="Edit a project";
					$rootScope.description="You can edit this project";
					$rootScope.hideAccounting = false;
					var Projects = $resource('/projects/:pid',{pid:projectid},{'edit':{method:'PUT'}});
					var project = Projects.get({pid:projectid}, function(){
						$timeout(function(){
							$rootScope.item = project;
                            $rootScope.pid = projectid;
                            $rootScope.cid = catid;
							$rootScope.$apply();
						},1,false);
					}, function(){
						log('ERROR');
					});
				} else if (catid && projectid == undefined){
					log("Edit category "+catid);
					$rootScope.title="Edit a category";
					$rootScope.description="You can edit this category";
                    var Categories = $resource('/categories/:cid',{cid:catid},{'edit':{method:'PATCH',isArray:false,headers:{'Content-Type':'application/json'}}});
                    var category = Categories.get({cid:catid}, function(){
                        $timeout(function(){
                            $rootScope.item = category;
                            $rootScope.pid = undefined;
                            $rootScope.cid = catid;
                            $rootScope.$apply();
                        },1,false);
                    }, function(){
                        log('ERROR');
                    });
				} else if (catid == undefined) {
					log("New category");
					$rootScope.title="Create a new category";
					$rootScope.description="";
				} if (catid && projectid == -1) {
					log("New project");
					$rootScope.title="Create a new project";
					$rootScope.description="";
					$rootScope.hideAccounting = false;
				}

				$rootScope.$apply();
                $rootScope.$popup = $(document.getElementById('editModal'));
                $rootScope.$popup.reveal();
			};

            $rootScope.save = function($event){
				log('save');
                $rootScope.$popup.trigger('reveal:close');
                $rootScope.item.$edit(function(data){
                    $rootScope.updateView(data, $rootScope.pid==undefined);
                });
                $event.stopPropagation();
                $event.preventDefault();
                return false;
			};
            $rootScope.updateView = function(item, isACategory) {
                var categories = $scope.categories;
                log(categories);
                log(item);
                for(var i= 0, nbCat=categories.length;i<nbCat;i++){
                    if (categories[i]['_id'] == $rootScope.cid) {
                        if (isACategory){
                            categories[i] = item;
                        } else {
                            var projects = categories[i]['projects'];
                            for(var j= 0, nbProject=projects.length;j<nbProject;j++){
                                if (projects[j]['id'] == $rootScope.pid) {
                                    projects[j] = item;
                                }
                            }
                        }
                    }
                }
                log(categories);
                $scope.categories = categories;
            };
            $rootScope.cancel = function($event){
                log('cancel');
                $rootScope.$popup.trigger('reveal:close');
                $event.stopPropagation();
                $event.preventDefault();
                return false;
            };
		},
		editProject: function(scope, element, attrs) {
			element.ready(function(){
				element.dblclick(function(){
					var pid = $(this).attr('data-projectId');
					var cid = $(this).closest('li').find('.title').attr('data-catid');
					scope.openModalCatProject(scope, cid, pid );
				});
			});
		},
		catDblclick: function(scope, element, attrs) {
			element.ready(function(){
				element.dblclick(function(){
					scope.openModalCatProject(scope, $(this).attr('data-catId'), undefined);
				});
			});
		}
	});
});
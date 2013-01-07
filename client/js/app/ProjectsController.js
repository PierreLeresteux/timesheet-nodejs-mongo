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
				if (catid && projectid && projectid.length>3) {
					log("Edit project "+catid+"-"+projectid);
					$rootScope.title="Edit a project";
					$rootScope.description="You can edit this project";
					$rootScope.hideAccounting = false;
                    $rootScope.create = false;
                    $rootScope.type = 'P';
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
                    $rootScope.create = false;
                    $rootScope.type = 'C';
                    var Categories = $resource('/categories/:cid',{cid:catid},{'edit':{method:'PATCH'}});
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
                    $rootScope.create = true;
                    $rootScope.type = 'C';
                    var Categories = $resource('/categories',{},{'edit':{method:'POST'}});
                    var category = new Categories();
                    $rootScope.item = category;
                    $rootScope.pid = undefined;
                    $rootScope.cid = undefined;
                    $rootScope.$apply();

				} if (catid && projectid == -1) {
					log("New project");
					$rootScope.title="Create a new project";
					$rootScope.description="";
					$rootScope.hideAccounting = false;
                    $rootScope.create = true;
                    $rootScope.type = 'P';
                    var Projects = $resource('/projects',{},{'edit':{method:'POST',params:{'category_id':catid}}});
                    var project = new Projects();
                    $rootScope.item = project;
                    $rootScope.pid = undefined;
                    $rootScope.cid = catid;
                    $rootScope.$apply();
				}

				$rootScope.$apply();
                $rootScope.$popup = $(document.getElementById('editModal'));
                $rootScope.$popup.reveal();
			};

            $rootScope.save = function($event){
                $rootScope.$popup.trigger('reveal:close');
                $rootScope.item.$edit(function(data){
                    $rootScope.updateView(data, $rootScope.type,$rootScope.create);
                });
                $event.stopPropagation();
                $event.preventDefault();
                return false;
			};
            $rootScope.updateView = function(item, type, creation) {
                var categories = $scope.categories;
                if (creation) {
                    if (type == 'C') {
                        categories[categories.length] = item;
                    } else {
                        for(var i= 0, nbCat=categories.length;i<nbCat;i++){
                            if (categories[i]['_id'] == $rootScope.cid) {
                                var projects = categories[i]['projects'];
                                projects[projects.length] = item;
                            }
                        }
                    }
                } else {
                    for(var i= 0, nbCat=categories.length;i<nbCat;i++){
                        if (categories[i]['_id'] == $rootScope.cid) {
                            if (type == 'C'){
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
                }
                $scope.categories = categories;
            };
            $rootScope.cancel = function($event){
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
define([], function(){

	var Router = function() {
		this.init.apply(this, arguments);
	};

	Router.prototype = {
		init: function() {
			log('Router > init');
			window.$module = angular.module('timesheet',  ['ngResource']);
			this.initRoutes();
			$(document.getElementsByTagName('html')[0]).attr('ng-app', 'timesheet');
			angular.bootstrap(document, ['timesheet']);
		},
		initRoutes: function() {
			log('Router > init routes');
			var that = this, statsController, projectsController;
			$module.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
				$routeProvider.when('/calendar', {
					'redirectTo': function() {
						that.loadCalendar();
					}
				});
				$routeProvider.when('/calendar/:year/:month', {
					'redirectTo': function(routeParams) {
						that.loadCalendar(routeParams);
					}
				});
				$routeProvider.when('/stats', {
					'redirectTo': function() {
						that.hide();
						require(['stats-controller'], function(StatsController) {
							log('Router > load StatsController');
							if(!statsController) {
								statsController = new StatsController('StatsController');
							}
							statsController.render();
							that.show();
						});
					}
				});
				$routeProvider.when('/projects', {
					'redirectTo': function() {
						that.hide();
						require(['projects-controller'], function(ProjectsController) {
							log('Router > load ProjectsController');
							if(!projectsController) {
								projectsController = new ProjectsController('ProjectsController');
							}
							projectsController.render();
							that.show();
						});
					}
				});
				$routeProvider.otherwise({'redirectTo': 'calendar'});
			}]);
		},
		show: function() {
			$body.removeAttr('style');
			$container.addClass('fade-in');
			$container.css('opacity', '1');
		},
		hide: function() {
			$container.removeClass('fade-in');
			$container.css('opacity', '0');
		},
		loadCalendar: function(routeParams) {
			var that = this;
			that.hide();
			log('Router > load CalendarController');
			require(['calendar-controller'], function(CalendarController) {
				if(!that.calendarController) {
					that.calendarController = new CalendarController();
				}
				that.calendarController.urlParams = routeParams;
				that.calendarController.render();
				that.show();
			});
		}
	}

	return Router;
});
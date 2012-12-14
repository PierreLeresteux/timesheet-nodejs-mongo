define([], function(){

	var Router = function() {
		this.init.apply(this, arguments);
	};

	Router.prototype = {
		init: function() {
			log('Router > init');
			this.initRoutes();
			$(document.getElementsByTagName('html')[0]).attr('ng-app', 'timesheet');
			angular.bootstrap(document, ['timesheet']);
		},
		initRoutes: function() {
			log('Router > init routes');
			var that = this;
			angular.module('timesheet', []).config(['$routeProvider', function($routeProvider) {
				$routeProvider.when('/calendar', {
					'redirectTo': function() {
						log('Router > load CalendarController');
						require(['calendar-controller'], function(CalendarController) {
							 new CalendarController('CalendarController').render();
						});
					}
				});
				$routeProvider.when('/stats', {
					'redirectTo': function() {
						require(['stats-controller'], function(StatsController) {
							log('Router > load StatsController');
							require(['stats-controller'], function(StatsController) {
								new StatsController('StatsController').render();
							});
						});
					}
				});
				$routeProvider.otherwise({'redirectTo': 'calendar'});
			}]);
		}
	}

	return Router;
});
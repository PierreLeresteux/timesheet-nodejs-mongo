define(['text!html/main.html'], function(Template){
	return {
		init: function() {
			log('MainController > init');
			this.initRoutes();
			$(document.getElementsByTagName('html')[0]).attr('ng-app', 'timesheet');
			angular.bootstrap(document, ['timesheet']);
		},
		initRoutes: function() {
			log('MainController > init routes');
			var that = this;
			angular.module('timesheet', []).
				config(['$routeProvider', function($routeProvider) {
					$routeProvider.
					when('/calendar', {
						'redirectTo': function() {
							log('redirectTo');
							require(['calendar-controller'], function(CalendarController) {
								log('MainController > load CalendarController');
								CalendarController.init();
							});
						}
					}).
					when('/stats', {
						'templateUrl': '/html/stats.html',
						'controller': that.statsController
					}).
					otherwise({
						'redirectTo': 'calendar'
					});
				}
			]);
		},
		calendarController: function() {
			log('calendarController');
		},
		statsController: function() {
			log('statsController');
		}
	};
});
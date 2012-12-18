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
			var that = this, calendarController, statsController;
			$module.config(['$routeProvider', function($routeProvider) {
				$routeProvider.when('/calendar', {
					'redirectTo': function() {
						that.hide();
						log('Router > load CalendarController');
						require(['calendar-controller'], function(CalendarController) {
							if(!calendarController) {
								calendarController = new CalendarController();
							}
							calendarController.render();
							that.show();
						});
					}
				});
				$routeProvider.when('/stats', {
					'redirectTo': function() {
						that.hide();
						require(['stats-controller'], function(StatsController) {
							log('Router > load StatsController');
							require(['stats-controller'], function(StatsController) {
								if(!statsController) {
									statsController = new StatsController('StatsController');
								}
								statsController.render();
								that.show();
							});
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
		}
	}

	return Router;
});
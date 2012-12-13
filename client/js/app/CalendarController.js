define(['text!html/calendar.html'], function(Template){
	return {
		init: function() {
			log('CalendarController > init');
			window.CalendarController = this.controller;
			window.CalendarController.$inject = ['$scope'];
			var $view = $(Template);
			$(document.getElementById('main-div')).empty().append($view);
			angular.bootstrap($view.get(0));
		},
		controller: function($scope) {
			log('CalendarController > controller');
		}
	};
});
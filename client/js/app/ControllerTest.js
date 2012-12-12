define(['require-text!html/angular-test.html'], function(Template){
	return {
		init: function() {
			log('ControllerTest > init');
			window.ControllerTest = this.controller;
			var html = $(Template).find('#angular-test-template').html();
			$(document.getElementsByTagName('body')[0]).html(html);
			angular.bootstrap(document);
		},
		controller: function($scope) {
			$scope.datas = [{'label': 'label 1'},{'label': 'label 2'},{'label': 'label 3'},{'label': 'label 4'}];
		}
	};
});
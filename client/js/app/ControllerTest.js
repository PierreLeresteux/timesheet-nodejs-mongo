define(['text!html/angular-test.html'], function(Template){
	return {
		init: function() {
			log('ControllerTest > init');
			window.ControllerTest1 = this.controller1;
			window.ControllerTest1.$inject = ['$scope'];
			window.ControllerTest2 = this.controller2;
			window.ControllerTest2.$inject = ['$scope'];
			this.$body = $(document.getElementsByTagName('body')[0]);
			var $view1 = $($(Template).find('#angular-test-template1').html());
			this.$body.append($view1);
			angular.bootstrap($view1.get(0));
		},
		controller1: function($scope) {
			$scope.datas = [{'label': 'label 1'},{'label': 'label 2'},{'label': 'label 3'},{'label': 'label 4'}];
		},
		controller2: function($scope) {
			$scope.datas = [{'label': 'lol 1'},{'label': 'lol 2'},{'label': 'lol 3'},{'label': 'lol 4'}];
		},
		addTemplate2: function() {
			var $view2 = $($(Template).find('#angular-test-template2').html());
			this.$body.append($view2);
			angular.bootstrap($view2.get(0));
		}
	};
});
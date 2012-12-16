define([], function(){

	var Controller = function(options) {
		this.init.apply(this, arguments);
	};

	Controller.extend = function(protoProps, staticProps) {
		var parent = this;
		var child;

		if(protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ parent.apply(this, arguments); };
		}

		_.extend(child, parent, staticProps);

		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		if(protoProps) {
			_.extend(child.prototype, protoProps);
		}

		child.__super__ = parent.prototype;

		return child;
	}

	Controller.prototype = {
		init: function(name, template) {
			log(name + ' > init');
			window[name] = this.controller;
			window[name].$inject = ['$scope'];
			this.name = name;
			if(template) {
				this.template = template;
			}
		},
		render: function() {
			log(this.name + ' > render');
			var $template = $(this.template);
			var $container;
			if(window.$container) {
				$container = window.$container;
			} else if(window.$body) {
				$container = window.$body;
			} else {
				$container = $(document.getElementsByTagName('body')[0]);
			}
			$container.empty().append($template);
			angular.bootstrap($template.get(0));
		},
		controller: function($scope) {
		}
	};

	return Controller;
});
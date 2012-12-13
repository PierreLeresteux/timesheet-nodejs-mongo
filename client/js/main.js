requirejs.config({
	baseUrl: './',
	paths: {
		// 3rd party
		'angular': '/libs/google/angularjs/1.0.3/angular.min',
		'zepto': '/libs/cdnjs/zepto/1.0rc1/zepto.min',
		'foundation': 'js/foundation/foundation.min',
		'foundation-app': 'js/foundation/app',
		'foundation-accordion': 'js/foundation/jquery.foundation.accordion',
		'foundation-alerts': 'js/foundation/jquery.foundation.alerts',
		'foundation-buttons': 'js/foundation/jquery.foundation.buttons',
		'foundation-clearing': 'js/foundation/jquery.foundation.clearing',
		'foundation-forms': 'js/foundation/jquery.foundation.forms',
		'foundation-joyride': 'js/foundation/jquery.foundation.joyride',
		'foundation-magellan': 'js/foundation/jquery.foundation.magellan',
		'foundation-mediaQueryToggle': 'js/foundation/jquery.foundation.mediaQueryToggle',
		'foundation-navigation': 'js/foundation/jquery.foundation.navigation',
		'foundation-orbit': 'js/foundation/jquery.foundation.orbit',
		'foundation-reveal': 'js/foundation/jquery.foundation.reveal',
		'foundation-tabs': 'js/foundation/jquery.foundation.tabs',
		'foundation-tooltips': 'js/foundation/jquery.foundation.tooltips',
		'foundation-topbar': 'js/foundation/jquery.foundation.topbar',
		'foundation-placeholder': 'js/foundation/jquery.placeholder',
		'modernizr-foundation': 'js/foundation/modernizr.foundation',
		'less': '/libs/cdnjs/less.js/1.3.1/less.min',
		'text': 'js/require/text-2.0.3',

		// local app
		'controller-test': 'js/app/ControllerTest'
	},
	shim: {
		'angular': {deps: ['zepto']},
		'foundation': {deps: ['zepto']},
		'foundation-app': {deps: ['foundation-accordion', 'foundation-alerts', 'foundation-buttons', 'foundation-clearing',
			'foundation-forms', 'foundation-joyride', 'foundation-magellan', 'foundation-mediaQueryToggle', 'foundation-navigation',
			'foundation-orbit', 'foundation-reveal', 'foundation-tabs', 'foundation-tooltips', 'foundation-topbar',
			'foundation-placeholder', 'modernizr-foundation']},
		'foundation-accordion': {deps: ['foundation']},
		'foundation-alerts': {deps: ['foundation']},
		'foundation-buttons': {deps: ['foundation']},
		'foundation-clearing': {deps: ['foundation']},
		'foundation-forms': {deps: ['foundation']},
		'foundation-joyride': {deps: ['foundation']},
		'foundation-magellan': {deps: ['foundation']},
		'foundation-mediaQueryToggle': {deps: ['foundation']},
		'foundation-navigation': {deps: ['foundation']},
		'foundation-orbit': {deps: ['foundation']},
		'foundation-reveal': {deps: ['foundation']},
		'foundation-tabs': {deps: ['foundation']},
		'foundation-tooltips': {deps: ['foundation']},
		'foundation-topbar': {deps: ['foundation']},
		'foundation-placeholder': {deps: ['foundation']},
		'modernizr-foundation': {deps: ['foundation']}
	}
});

require(['angular', 'zepto', 'foundation', 'foundation-app', 'foundation-accordion', 'foundation-alerts', 'foundation-buttons',
		'foundation-clearing', 'foundation-forms', 'foundation-joyride', 'foundation-magellan', 'foundation-mediaQueryToggle',
		'foundation-navigation', 'foundation-orbit', 'foundation-reveal', 'foundation-tabs', 'foundation-topbar', 'foundation-placeholder',
		'modernizr-foundation', 'text'],
	function() {
		window.log = function(log) {
			console.log(log);
		}

		if(window.debugMode) {
			require(['less']);
		}

		$(document).ready(function(){
			init();
		});
	}
);

var init = function() {
	log('init');
	require(['controller-test'], function(ControllerTest){
		ControllerTest.init();
		setTimeout(function() {
			ControllerTest.addTemplate2();
		}, 1000);
	});
}
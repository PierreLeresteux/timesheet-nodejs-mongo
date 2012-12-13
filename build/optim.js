({
	appDir: '../client',
	baseUrl: './',
	dir: 'output',
	mainConfigFile: '../client/js/main.js',
	modules: [
		{
			name: 'js/main',
			exclude: ['controller-test']
		}
	],
	paths: {
		'angular': 'empty:',
		'zepto': 'empty:',
		'foundation': 'empty:',
		'foundation-app': 'empty:',
		'foundation-accordion': 'empty:',
		'foundation-alerts': 'empty:',
		'foundation-buttons': 'empty:',
		'foundation-clearing': 'empty:',
		'foundation-forms': 'empty:',
		'foundation-joyride': 'empty:',
		'foundation-magellan': 'empty:',
		'foundation-mediaQueryToggle': 'empty:',
		'foundation-navigation': 'empty:',
		'foundation-orbit': 'empty:',
		'foundation-reveal': 'empty:',
		'foundation-tabs': 'empty:',
		'foundation-tooltips': 'empty:',
		'foundation-topbar': 'empty:',
		'foundation-placeholder': 'empty:',
		'modernizr-foundation': 'empty:',
		'less': 'empty:'
	},
	inlineText: false,
	skipModuleInsertion: true,
	optimizeCss: 'none',
	optimize: 'uglify2',
	uglify2: {
		'comments': /foobar/
	},
	fileExclusionRegExp: /(^\.)|(^less$)/
})
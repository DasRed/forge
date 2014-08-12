'use strict';
// https://github.com/jrburke/r.js/blob/master/build/example.build.js
require.config(
{
	baseUrl: '/app/',

	waitSeconds: 15,

	deps:
	[
		'main'
	],
	paths:
	{
		backbone: '../lib/backbone',
		lodash: '../lib/lodash',
		jQuery: '../lib/jquery',
		forge: '../../',

		text: '../../requirejs/plugins/text/text',
		tpl: '../../requirejs/plugins/tpl',
		cfg: '../../requirejs/plugins/cfg',

		main: 'main'
	},

	map:
	{
		'*':
		{
			jquery: 'jQuery',
			underscore: 'lodash'
		}
	},

	shim:
	{
		main:
		{
			deps:
			[
				'forge/native/function',
				'forge/native/intl'
			]
		},
		jQuery: {exports: 'jQuery'}
	}
});
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
		lodash: '../lib/lodash',
		jQuery: '../lib/jquery',
		forge: '../../',

		tpl: '../../requirejs/plugins/tpl',
		cfg: '../../requirejs/plugins/cfg',

		main: 'main'
	},

	map:
	{
		'*':
		{
			jquery: 'jQuery'
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
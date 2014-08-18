'use strict';
define(
[
	'lodash',
	'forge/config/loader'
], function(
	lodash,
	ConfigLoader
)
{
	var config = null;

	try
	{
		config = (new ConfigLoader('#application',
		{
			throwError: false
		})).config;
	}
	catch (exception)
	{
		config = {};
	}
	finally
	{
		config = lodash.merge(
		{
			language: 'en_GB',
			log:
			{
				level: 4,
				sendToServer: false,
				serverUrl: 'log/console'
			},
			profiling:
			{
				sendToServer: false,
				serverUrl: 'log/profiling'
			}
		}, config);
	}

	if (config.locale === undefined)
	{
		config.locale = config.language.replace('_', '-');
	}

	return config;
});
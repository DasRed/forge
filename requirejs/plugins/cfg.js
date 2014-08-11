'use strict';

define(
[
	'lodash',
	'forge/config/loader',
	'forge/config/application',
	'forge/config/translation'
], function(
	lodash,
	ConfigLoader,
	configApplication,
	translation
)
{
	var configLoader =
	{
		/**
		 * @param {String} name
		 * @param {Function} parentRequire
		 * @param {Function} onload
		 * @param {Object} config
		 */
		load: function(name, parentRequire, onload, config)
		{
			/**
			 * Indicate that the optimizer should not wait for this resource any more and complete optimization.
			 * This resource will be resolved dynamically during run time in the web browser.
			 */
			if (config.isBuild)
			{
				onload();
			}
			// Do something else that can be async.
			else
			{
				var loadedConfig = null;

				switch(name)
				{
					case 'application':
						loadedConfig = configApplication;
						break;

					case 'translation':
						loadedConfig = translation;
						break;

					default:
						try
						{
							loadedConfig = (new ConfigLoader('#' + name,
							{
								throwError: false
							})).config;
						}
						catch (exception)
						{
							console.error(exception.message);
						}
						finally
						{
							loadedConfig = lodash.merge({}, loadedConfig);
						}

						break;
				}

				console.debug('Config loaded from #' + name);
				onload(loadedConfig);
			}
		}
	};

	return configLoader;
});

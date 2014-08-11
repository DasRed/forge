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
				var config = null;

				switch(name)
				{
					case 'application':
						config = configApplication;
						break;

					case 'translation':
						config = translation;
						break;

					default:
						try
						{
							config = (new ConfigLoader('#' + name,
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
							config = lodash.merge({}, config);
						}

						break;
				}

				console.debug('Config loaded from #' + name);
				onload(config);
			}
		}
	};

	return configLoader;
});

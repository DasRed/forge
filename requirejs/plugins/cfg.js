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
		 * @param {Function} onLoad
		 * @param {Object} config
		 */
		load: function(name, parentRequire, onLoad, config)
		{
			/**
			 * Indicate that the optimizer should not wait for this resource any more and complete optimization.
			 * This resource will be resolved dynamically during run time in the web browser.
			 */
			if (config.isBuild)
			{
				onLoad(null);
				return;
			}

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
			onLoad(loadedConfig);
		},

		/**
		 *
		 * @param {String} pluginName
		 * @param {String} moduleName
		 * @param {Function} write
		 */
		write: function (pluginName, moduleName, write)
		{
			var functionToWrite = ['define("' + pluginName + '!' + moduleName + '", '];

			switch(moduleName)
			{
				case 'application':
					functionToWrite = functionToWrite.concat(
					[
						'["forge/config/application"], function(configApplication)',
						'{',
							'return configApplication;',
						'}'
					]);
					break;

				case 'translation':
					functionToWrite = functionToWrite.concat(
					[
						'["forge/config/translation"], function(translation)',
						'{',
							'return translation;',
						'}'
					]);
					break;

				default:
					functionToWrite = functionToWrite.concat(
					[
						'["forge/config/loader"], function(ConfigLoader)',
						'{',
							'return (new ConfigLoader("#' + moduleName + '")).config;',
						'}'
					]);
					break;
			}

			functionToWrite = functionToWrite.concat([');']);

			write(functionToWrite.join('\n'));
		}
	};

	return configLoader;
});

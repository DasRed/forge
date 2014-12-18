'use strict';

define(
[
	'lodash',
	'cfg!translation',
	'text'
], function(
	lodash,
	translation,
	text
)
{
	var translator = lodash.uniqueId('___translator');

	var htmlStripWhitespacesRegEx =
	{
		' ': /(\n)|(\r)/gi,
		'': /(\t)/gi,
		'><': />\s*</gi
	};

	var templateLoader =
	{
		/**
		 * @param {String} name
		 * @param {Function} parentRequire
		 * @param {Function} onLoad
		 * @param {Object} config
		 */
		load: function(name, parentRequire, onLoad, config)
		{
			if (config.isBuild == true)
			{
				onLoad(null);
				return;
			}

			if (name.lastIndexOf('.') === -1)
			{
				name += '.html';
			}

			text.load(name, parentRequire, function(content)
			{
				var contentReplaced = content;

				// convert whitespaces between html tags to nothing and remove Tabs and Linebreaks
				for (var replacement in htmlStripWhitespacesRegEx)
				{
					contentReplaced = contentReplaced.replace(htmlStripWhitespacesRegEx[replacement], replacement);
				}

				// convert template into lodash.template function
				var templatePrepared = lodash.template(contentReplaced);

				// create function for translation AFTER template executing
				var template = function(obj)
				{
					return translation.translateInline(templatePrepared(obj));
				};

				// return it
				onLoad(template);
			}, config);
		},

		/**
		 *
		 * @param {String} pluginName
		 * @param {String} moduleName
		 * @param {Function} write
		 */
		write: function (pluginName, moduleName, write)
		{
			var moduleNameWithExtension = moduleName;
			if (moduleNameWithExtension.lastIndexOf('.') === -1)
			{
				moduleNameWithExtension += '.html';
			}

			text.load(moduleNameWithExtension, require, function(content)
			{
				var contentReplaced = content;

				// convert whitespaces between html tags to nothing and remove Tabs and Linebreaks
				for (var replacement in htmlStripWhitespacesRegEx)
				{
					contentReplaced = contentReplaced.replace(htmlStripWhitespacesRegEx[replacement], replacement);
				}
				// convert template into lodash.template function
				var templatePrepared = String(lodash.template(contentReplaced));
				templatePrepared = templatePrepared.replace('return __p', 'return ' + translator + '.translateInline(__p)');

				write(
				[
					'define("' + pluginName + '!' + moduleName + '", ["lodash", "cfg!translation"], function (lodash, ' + translator + ') {',
						'var importsKeys = lodash.keys(lodash.templateSettings.imports);',
						'var importsValues = lodash.values(lodash.templateSettings.imports);',
						'var source = \'' + text.jsEscape(templatePrepared) + '\';',
						'',
						'importsKeys.push(\'' + translator + '\');',
						'importsValues.push(' + translator + ');',
						'',
						'try {',
							'var result = Function(importsKeys, \'return \' + source).apply(undefined, importsValues);',
						'} catch(e) {',
							'e.source = source;',
							'throw e;',
						'}',
						'result.source = source;',
						'return result;',
					'});'
				].join('\n'));
			},
			{
				isBuild: false
			});
		}
	};

	return templateLoader;
});
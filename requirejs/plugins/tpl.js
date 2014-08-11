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

				var contentTranslated = translation.translateInline(contentReplaced);

				// convert template into lodash.template function
				var template = lodash.template(contentTranslated);
				template.content =
				{
					original: content,
					replaced: contentReplaced,
					translated: contentTranslated
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

				write((
				[
					'define("' + pluginName + '!' + moduleName + '", ["lodash", "cfg!translation"], function (lodash, translation) {',
						'var contentReplaced = \'' + text.jsEscape(contentReplaced) + '\';',
						'var contentTranslated = translation.translateInline(contentReplaced);',
						'var template = lodash.template(contentTranslated);',

						'template.content =',
						'{',
							'original: \'' + text.jsEscape(content) + '\',',
							'replaced: contentReplaced,',
							'translated: contentTranslated',
						'};',

						'return template;',
					'});'
				]).join('\n'));
			},
			{
				isBuild: false
			});
		}
	};

	return templateLoader;
});
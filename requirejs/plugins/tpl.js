'use strict';

define(
[
	'lodash',
	'config!translation',
	'forge/requirejs/plugins/text/text'
], function(
	lodash,
	translation,
	textFromForge
)
{
	var text = textFromForge;

	if (require.defined('text') === true)
	{
		text = require('text');
	}

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
				if (name.lastIndexOf('.') === -1)
				{
					name += '.html';
				}

				//req has the same API as require().
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
					onload(template);
				}, config);
			}
		}
	};

	return templateLoader;
});

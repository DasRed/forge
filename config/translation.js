'use strict';
define(
[
	'lodash',
	'forge/translation',
	'forge/config/loader',
	'forge/config/application'
], function(
	lodash,
	Translation,
	ConfigLoader,
	configApplication
)
{
	// create the translation instance
	var translation = new Translation((new ConfigLoader('#translation',
	{
		throwError: false
	})).config,
	{
		language: configApplication.language
	});

	// Translation in templates
	lodash.templateSettings.imports.translate = function()
	{
		translation.translate.apply(translation, arguments);
	};

	lodash.templateSettings.imports.__ = lodash.templateSettings.imports.translate;

	if (console.debug !== undefined)
	{
		console.debug('Translations started.');
	}

	return translation;
});
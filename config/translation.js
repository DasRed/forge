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
		locale: configApplication.locale
	});

	// Translation in templates
	lodash.templateSettings.imports.translate = function()
	{
		return translation.translate.apply(translation, arguments);
	};

	lodash.templateSettings.imports.__ = lodash.templateSettings.imports.translate;

	if (console.debug !== undefined)
	{
		console.debug('Translations started.');
	}

	return translation;
});
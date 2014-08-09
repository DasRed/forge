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
	var translation = new Translation((new ConfigLoader('#translations')).config,
	{
		language: configApplication.language
	});

	// Translation in templates
	lodash.templateSettings.imports.translate = translation.translate.bind(translation);
	lodash.templateSettings.imports.__ = lodash.templateSettings.imports.translate;

	console.debug('Translations started.');

	return translation;
});
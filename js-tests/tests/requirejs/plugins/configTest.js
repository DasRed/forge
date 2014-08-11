'use strict';

require(
[
	'config!configTest1',
	'config!configTest2',
	'config!configTest3',
	'config!configTest4',
	'config!application',
	'forge/config/application',
	'config!translation',
	'forge/config/translation',
], function(
	configTest1,
	configTest2,
	configTest3,
	configTest4,
	configApplicationByConfig,
	configApplicationByRequire,
	translationByConfig,
	translationByRequire
)
{
	describe('requirejs/plugins/config', function()
	{
		it('must return the object for configTest1', function()
		{
			expect(configTest1).toEqual(
			{
				a: 1,
				b: 2,
				c: 'c'
			});
		});

		it('must return an empty object if config entry is empty', function()
		{
			expect(configTest2).toEqual({});
		});

		it('must return an empty object if config entry is invalid', function()
		{
			expect(configTest3).toEqual({});
		});

		it('must return an empty object if config entry does not exists', function()
		{
			expect(configTest4).toEqual({});
		});

		it('must return an the application config from forge/config/application', function()
		{
			expect(configApplicationByConfig).toBe(configApplicationByRequire);
		});

		it('must return an the translation config from forge/config/translation', function()
		{
			expect(translationByConfig).toBe(translationByRequire);
		});
	});
});
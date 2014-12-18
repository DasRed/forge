'use strict';

require(
[
	'tpl!requirejs/plugins/tpl/withWhitespace',
	'tpl!requirejs/plugins/tpl/withWhitespace.html'
], function(
	tplRequirejsPluginsTplWithWhitespace,
	tplRequirejsPluginsTplWithWhitespaceWithExtension
)
{
	describe('forge/requirejs/plugins/tpl', function()
	{
		it('must return a lodash Template function', function()
		{
			expect(tplRequirejsPluginsTplWithWhitespace instanceof Function).toBe(true);
			expect(tplRequirejsPluginsTplWithWhitespace(
			{
				test: 'Hello World'
			})).toBe('<nav><div><h2>this is the h2</h2><ul id="navigation">Hello World</ul></div></nav>');
		});

		it('should not append extension .html to load a template if the extension is defined', function()
		{
			expect(tplRequirejsPluginsTplWithWhitespaceWithExtension.content).toBe(tplRequirejsPluginsTplWithWhitespace.content);
		});
	});
});
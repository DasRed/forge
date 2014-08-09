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
	describe('requirejs/plugins/tpl', function()
	{
		it('must return a lodash Template function', function()
		{
			expect(tplRequirejsPluginsTplWithWhitespace instanceof Function).toBe(true);
			expect(tplRequirejsPluginsTplWithWhitespace(
			{
				test: 'Hello World'
			})).toBe('<nav><div><h2>this is the h2</h2><ul id="navigation">Hello World</ul></div></nav>');
		});

		it('must define content data on the template function', function()
		{
			expect(tplRequirejsPluginsTplWithWhitespace.content).not.toBeUndefined();
			expect(tplRequirejsPluginsTplWithWhitespace.content.original).not.toBeUndefined();
			expect(tplRequirejsPluginsTplWithWhitespace.content.replaced).not.toBeUndefined();
			expect(tplRequirejsPluginsTplWithWhitespace.content.translated).not.toBeUndefined();
		});

		it('should containt the content information on the template function', function()
		{
			expect(tplRequirejsPluginsTplWithWhitespace.content.original).toEqual('<nav>\n\t<div>\n\t\t<h2>{translation.h2}</h2>\n\t\t<ul id="navigation">${test}</ul>\n\t</div>\n</nav>');
			expect(tplRequirejsPluginsTplWithWhitespace.content.replaced).toEqual('<nav><div><h2>{translation.h2}</h2><ul id="navigation">${test}</ul></div></nav>');
			expect(tplRequirejsPluginsTplWithWhitespace.content.translated).toEqual('<nav><div><h2>this is the h2</h2><ul id="navigation">${test}</ul></div></nav>');
		});

		it('should not append extension .html to load a template if the extension is defined', function()
		{
			expect(tplRequirejsPluginsTplWithWhitespaceWithExtension.content.original).toBe(tplRequirejsPluginsTplWithWhitespace.content.original);
		});
	});
});
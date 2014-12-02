'use strict';
define(
[
	'forge/native/dom/token/list/shim'
], function(
	DOMTokenListShim
)
{
	// find the DOMTokenList
	var DOMTokenList = window.DOMTokenList;

	// browser does not support
	if (DOMTokenList === undefined)
	{
		window.DOMTokenList = DOMTokenList = DOMTokenListShim;
	}

	// browser support it
	else if (DOMTokenList !== undefined)
	{
		var testElement = document.createElement('_');
		var polyfillMultipleArguments = false;

		// Polyfill for IE 10/11 and Firefox <26, where classList.add and
		// classList.remove exist but support only one argument at a time.
		testElement.classList.add('c1', 'c2');
		polyfillMultipleArguments = (testElement.classList.contains('c2') === false);

		// add support for 'a b' and '' AND
		// Polyfill for IE 10/11 and Firefox <26, where classList.add and
		// classList.remove exist but support only one argument at a time.
		var addOriginal = DOMTokenList.prototype.add;
		DOMTokenList.prototype.add = function()
		{
			var tokens = DOMTokenListShim.convertTokens(arguments);
			var length = tokens.length;
			if (length === 0)
			{
				return;
			}

			if (polyfillMultipleArguments === true)
			{
				for (var i = 0; i < length; i++)
				{
					addOriginal.apply(this, tokens[i]);
				}
				return;
			}

			addOriginal.apply(this, tokens);
		};

		// remove support for 'a b' and '' AND
		// Polyfill for IE 10/11 and Firefox <26, where classList.add and
		// classList.remove exist but support only one argument at a time.
		var removeOriginal = DOMTokenList.prototype.remove;
		DOMTokenList.prototype.remove = function()
		{
			var tokens = DOMTokenListShim.convertTokens(arguments);
			var length = tokens.length;
			if (length === 0)
			{
				return;
			}

			if (polyfillMultipleArguments === true)
			{
				for (var i = 0; i < length; i++)
				{
					removeOriginal.apply(this, tokens[i]);
				}
				return;
			}

			removeOriginal.apply(this, tokens);
		};

		// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
		// support the second argument.
		testElement.classList.toggle('c3', false);
		if (testElement.classList.contains('c3') === true)
		{
			var toggleOriginal = DOMTokenList.prototype.toggle;
			DOMTokenList.prototype.toggle = function(token, force)
			{
				if (1 in arguments && !this.contains(token) === !force)
				{
					return force;
				}

				return toggleOriginal.call(this, token);
			};
		}

		testElement = null;
	}

	return DOMTokenList;
});
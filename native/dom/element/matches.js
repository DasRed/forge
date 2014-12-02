'use strict';

define([], function()
{
	if (('matches' in document.body) === false)
	{
		var matchesFn = 'matches';

		// find vendor prefix
		['webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn)
		{
			if (typeof document.body[fn] == 'function')
			{
				matchesFn = fn;
				return true;
			}
			return false;
		});

		window.Element.prototype.matches = document.body[matchesFn];
	}
});
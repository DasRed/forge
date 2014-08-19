'use strict';

define([], function()
{
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimLeft
	if ((String.prototype.trimLeft instanceof Function) === false)
	{
		var trimLeftRegEx = /^\s+/g;
		String.prototype.trimLeft = function()
		{
			return this.replace(trimLeftRegEx, '');
		};
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimRight
	if ((String.prototype.trimRight instanceof Function) === false)
	{
		var trimRightRegEx = /\s+$/g;
		String.prototype.trimRight = function()
		{
			return this.replace(trimRightRegEx, '');
		};
	}
});
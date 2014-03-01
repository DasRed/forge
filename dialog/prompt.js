'use strict';
define([], function()
{
	var prompt = window.prompt;

	/**
	 * @param {String} message
	 * @param {String} value
	 * @param {Function} success
	 * @param {Function} error
	 */
	window.prompt = function(message, value, success, error)
	{
		var callback = error;

		var result = prompt(message, value);

		if (result !== null)
		{
			callback = success;
		}

		if (callback instanceof Function)
		{
			callback(result);
		}
	};

	return window.prompt;
});
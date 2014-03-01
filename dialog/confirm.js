'use strict';
define([], function()
{
	var confirm = window.confirm;

	/**
	 * @param {String} message
	 * @param {Function} success
	 * @param {Function} error
	 */
	window.confirm = function(message, success, error)
	{
		var callback = error;

		if (confirm(message) == true)
		{
			callback = success;
		}

		if (callback instanceof Function)
		{
			callback();
		}
	};

	return window.confirm;
});
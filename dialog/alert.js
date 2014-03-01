'use strict';
define([], function()
{
	var alert = window.alert;

	/**
	 * @param {String} message
	 * @param {Function} success
	 */
	window.alert = function(message, success)
	{
		var callback = success;

		alert(message);

		if (callback instanceof Function)
		{
			callback();
		}
	};

	return window.alert;
});
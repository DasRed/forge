'use strict';

define([], function()
{
	/**
	 * clones the current Date
	 * @returns {Date}
	 */
	Date.prototype.clone = function()
	{
		return new Date(this.getTime());
	};
});
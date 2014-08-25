'use strict';

define(
[
	'jQuery'
], function(
	jQuery
)
{
	jQuery.extend(jQuery.Event.prototype,
	{
		/**
		 * stops the event complete
		 *
		 * @returns {jQuery.Event}
		 */
		stop: function()
		{
			this.stopPropagation();
			this.preventDefault();

			return this;
		}
	});
});
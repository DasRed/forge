'use strict';

define(
[
	'forge/backbone/compatibility',
	'forge/backbone/view'
], function(
	compatibility,
	View
)
{
	/**
	 * A View for one entry in list
	 *
	 * @param {Object} options
	 * @returns ViewListEntry
	 */
	var ViewListEntry = function(options)
	{
		View.apply(this, arguments);

		return this;
	};


	// prototypew
	ViewListEntry.prototype = Object.create(View.prototype);

	/**
	 * render
	 *
	 * @returns {ViewListEntry}
	 */
	ViewListEntry.prototype.render = function()
	{
		View.prototype.render.apply(this, arguments);

		this.$el.attr('data-model-cid', this.model.cid);

		return this;
	};

	return compatibility(ViewListEntry);
});
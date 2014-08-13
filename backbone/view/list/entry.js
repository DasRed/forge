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

	// prototype
	ViewListEntry.prototype = Object.create(View.prototype,
	{
		/**
		 * the list of the entry
		 *
		 * @var {ViewList}
		 */
		list:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * tag name of list entry
		 *
		 * @var {String}
		 */
		tagName:
		{
			value: 'li',
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

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
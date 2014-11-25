'use strict';

define(
[
	'forge/backbone/compatibility',
	'forge/backbone/view/list/entry'
], function(
	compatibility,
	ViewListEntry
)
{
	/**
	 * A View for one entry in table
	 *
	 * @param {Object} options
	 */
	function ViewTableEntry(options)
	{
		ViewListEntry.apply(this, arguments);
	}

	// prototype
	ViewTableEntry.prototype = Object.create(ViewListEntry.prototype,
	{
		/**
		 * tag name of table entry
		 *
		 * @var {String}
		 */
		tagName:
		{
			value: 'tr',
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * @returns {ViewTableEntry}
	 */
	ViewTableEntry.prototype.render = function()
	{
		ViewListEntry.prototype.render.apply(this, arguments);

		var elementDataModels = this.$el.find('th, td');
		var elementColumnsLength = elementDataModels.length;
		var elementColumn = undefined;
		var positionOriginal = undefined;

		var i = undefined;
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = elementDataModels.eq(i);
			positionOriginal = elementColumn.attr('data-column-position');
			if (positionOriginal === undefined)
			{
				elementColumn.attr('data-column-position', i);
			}
		}

		return this;
	};

	return compatibility(ViewTableEntry);
});
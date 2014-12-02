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

		return this.updateDataAttributes();
	};

	/**
	 * @returns {ViewTableEntry}
	 */
	ViewTableEntry.prototype.updateDataAttributes = function()
	{
		var elementDataModels = this.el.querySelectorAll('th, td');
		var elementColumn = undefined;
		var positionOriginal = undefined;

		for (var i = 0, length = elementDataModels.length; i < length; i++)
		{
			elementColumn = elementDataModels[i];
			positionOriginal = elementColumn.getAttribute('data-column-position');
			if (positionOriginal === null || positionOriginal == '')
			{
				elementColumn.setAttribute('data-column-position', i);
			}
		}

		return this;
	};

	return compatibility(ViewTableEntry);
});
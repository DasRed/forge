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
	 * @returns ViewListEntry
	 */
	var ViewTableEntry = function(options)
	{
		return ViewListEntry.apply(this, arguments);
	};

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

	return compatibility(ViewTableEntry);
});
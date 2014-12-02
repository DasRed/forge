'use strict';

define(
[
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/view/table/entry',
	'forge/backbone/view/list/select/entry'
], function(
	lodash,
	compatibility,
	ViewTableEntry,
	ViewListSelectEntry
)
{
	/**
	 * A View for one entry in list selected
	 *
	 * @event {void} select({ViewTableSelectEntry} viewEntry)
	 * @param {Object} options
	 */
	function ViewTableSelectEntry(options)
	{
		ViewListSelectEntry.apply(this, arguments);
	}

	// prototype
	ViewTableSelectEntry.prototype = Object.create(ViewListSelectEntry.prototype);

	// mixin of ViewTableEntry
	lodash.extend(ViewTableSelectEntry.prototype, ViewTableEntry.prototype,
	{
		constructor: undefined
	});

	/**
	 * @returns {ViewTableEntry}
	 */
	ViewTableSelectEntry.prototype.render = function()
	{
		ViewListSelectEntry.prototype.render.apply(this, arguments);

		return this.updateDataAttributes();
	};


	return compatibility(ViewTableSelectEntry);
});
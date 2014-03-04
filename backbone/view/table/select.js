'use strict';

define(
[
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/view/table',
	'forge/backbone/view/list/select'
], function(
	lodash,
	compatibility,
	ViewTable,
	ViewListSelect
)
{
	/**
	 * list of view with selection
	 *
	 * @event {void} change({ViewTableSelect} view, {Model} modelSelectedOld, {View} viewModelSelectedOld, {Model} modelSelectedNew, {View} viewModelSelectedNew)
	 * @param {Object} options
	 * @returns {ViewListSelect}
	 */
	var ViewTableSelect = function(options)
	{
		ViewListSelect.apply(this, arguments);

		return this;
	};

	// prototype
	ViewTableSelect.prototype = Object.create(ViewListSelect.prototype);

	// mixin of ViewTable
	lodash.extend(ViewTableSelect.prototype, ViewTable.prototype);

	return compatibility(ViewTableSelect);
});
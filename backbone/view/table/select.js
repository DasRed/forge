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
	 */
	function ViewTableSelect(options)
	{
		ViewListSelect.apply(this, arguments);
	}

	// prototype
	ViewTableSelect.prototype = Object.create(ViewListSelect.prototype);

	// mixin of ViewTable
	lodash.extend(ViewTableSelect.prototype, ViewTable.prototype);

	/**
	 * render function with setting the data type
	 * @returns {ViewTableSelect}
	 */
	ViewTableSelect.prototype.render = function()
	{
		ViewListSelect.prototype.render.apply(this, arguments);

		this.renderTable();

		return this;
	};

	return compatibility(ViewTableSelect);
});
'use strict';

define(
[
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/view/table/select',
	'forge/backbone/view/list/select/multi'
], function(
	lodash,
	compatibility,
	ViewTableSelect,
	ViewListSelectMulti
)
{
	/**
	 * A View for one entry in list selected
	 *
	 * @event {void} select({ViewTableSelectEntry} viewEntry)
	 * @param {Object} options
	 */
	function ViewTableSelectMulti(options)
	{
		ViewListSelectMulti.apply(this, arguments);
	}

	// prototype
	ViewTableSelectMulti.prototype = Object.create(ViewListSelectMulti.prototype);

	// mixin of ViewTableSelect
	lodash.extend(ViewTableSelectMulti.prototype, ViewTableSelect.___wrapped ? ViewTableSelect.prototype.__proto__ : ViewTableSelect.prototype,
	{
		constructor: undefined
	});

	/**
	 * render some requirements
	 *
	 * @returns {ViewTableSelectMulti}
	 */
	ViewTableSelectMulti.prototype.renderRequirementsFinished = function()
	{
		ViewListSelectMulti.prototype.renderRequirementsFinished.apply(this, arguments);

		this.renderTable();

		return this;
	};

	return compatibility(ViewTableSelectMulti);
});
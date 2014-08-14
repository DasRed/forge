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
	lodash.extend(ViewTableSelectMulti.prototype, ViewTableSelect.prototype);

	return compatibility(ViewTableSelectMulti);
});
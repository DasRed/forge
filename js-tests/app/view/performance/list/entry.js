'use strict';

define(
[
	'forge/backbone/view/table/entry',
	'tpl!template/performance/list/entry'
], function(
	ViewTableEntry,
	templatePerformanceListEntry
)
{
	var ViewPerformanceListEntry = ViewTableEntry.extend(
	{
		/**
		 * @var {String}
		 */
		template: templatePerformanceListEntry
	});

	return ViewPerformanceListEntry;
});
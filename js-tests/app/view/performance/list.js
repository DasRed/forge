'use strict';

define(
[
	'forge/backbone/view/table',
	'view/performance/list/entry',
	'tpl!template/performance/list'
], function(
	ViewListSelect,
	ViewPerformanceListEntry,
	templatePerformanceList
)
{
	var ViewPerformanceList = ViewListSelect.extend(
	{
		/**
		 * @var {Boolean}
		 */
		autoCustomize: false,

		/**
		 * @var {Function}
		 */
		template: templatePerformanceList,

		/**
		 * @var {ViewPerformanceListEntry}
		 */
		viewEntry: ViewPerformanceListEntry
	});

	return ViewPerformanceList;
});
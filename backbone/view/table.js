'use strict';
define(
[
	'forge/backbone/compatibility',
	'forge/backbone/view/list'
], function(
	compatibility,
	ViewList
)
{
	/**
	 * table of view
	 *
	 * @param {Object} options
	 * @returns {ViewTable}
	 */
	var ViewTable = function(options)
	{
		return ViewList.apply(this, arguments);
	};

	// prototype
	ViewTable.prototype = Object.create(ViewList.prototype,
	{
		/**
		 * css selector for the container which gets all entries append if this is null or undefined
		 * this.$el will be taken
		 *
		 * @var {String}
		 */
		selectorContainer:
		{
			value: 'tbody',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * css selector for the container for loading element
		 *
		 * @var {String}
		 */
		selectorLoading:
		{
			value: 'table',
			enumerable: true,
			configurable: true,
			writable: true
		},


		/**
		 * tag name of list
		 *
		 * @var {String}
		 */
		tagName:
		{
			value: 'table',
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return compatibility(ViewTable);
});
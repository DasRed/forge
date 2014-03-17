'use strict';
define(
[
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/view/list',
	'forge/backbone/view/table/filter',
	'forge/backbone/view/table/sorter'
], function(
	lodash,
	compatibility,
	ViewList,
	ViewTableFilter,
	ViewTableSorter
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

	/**
	 * creates the filter view
	 *
	 * @param {Object} options
	 * @returns {ViewTableFilter}
	 */
	ViewTable.prototype.createViewFilter = function(options)
	{
		if (ViewTableFilter === undefined)
		{
			ViewTableFilter = require('forge/backbone/view/table/filter');
		}

		return new ViewTableFilter(options);
	};

	/**
	 * creates the sorter view
	 *
	 * @param {Object} options
	 * @returns {ViewTableSorter}
	 */
	ViewTable.prototype.createViewSorter = function(options)
	{
		if (ViewTableSorter === undefined)
		{
			ViewTableSorter = require('forge/backbone/view/table/sorter');
		}

		return new ViewTableSorter(options);
	};


	/**
	 * renders a sorter view for list with given options
	 * if not options defined no sorter will be rendered
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderSorter = function()
	{
		if (this.sorterOptions === null || this.sorterOptions === undefined)
		{
			return this;
		}

		// options
		var options = lodash.extend(
		{
			autoRender: true,
			view: this
		}, this.sorterOptions || {});

		// create the view
		this.viewSorter = this.createViewSorter(options);

		return this;
	};

	return compatibility(ViewTable);
});
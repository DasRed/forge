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
	 */
	function ViewTable(options)
	{
		ViewList.apply(this, arguments);
	}

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
		 * object of sorter options. if sorterOptions is null, no filter will be rendered
		 *
		 * @see ViewListSorter
		 * @var {Object}
		 */
		sorterOptions:
		{
			value: true,
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
	 * render function with setting the data type
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.render = function()
	{
		ViewList.prototype.render.apply(this, arguments);

		this.updateDataAttributes();

		return this;
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

	/**
	 * update the elements with data-type by model attribute type
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.updateDataAttributes = function()
	{
		// remap to unique view selector
		if (this.collection !== null && this.collection !== undefined)
		{
			var elementDataModels = this.$el.find(this.selectorDataModel);
			var elementDataModelsLength = elementDataModels.length;
			var elementDataModel = undefined;
			var elementDataModelPropertyName = undefined;
			var modelAttributeTypes = this.collection.model.getPrototypeValue('attributeTypes');
			var i = undefined;
			for (i = 0; i < elementDataModelsLength; i++)
			{
				elementDataModel = jQuery(elementDataModels[i]);
				elementDataModelPropertyName = elementDataModel.attr('data-model');

				elementDataModel.attr('data-type', modelAttributeTypes[elementDataModelPropertyName]);
			}
		}

		return this;
	};

	return compatibility(ViewTable);
});

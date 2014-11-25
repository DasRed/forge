'use strict';
define(
[
	'jQuery',
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/view/list',
	'forge/backbone/view/table/filter',
	'forge/backbone/view/table/sorter',
	'forge/backbone/view/table/customizer'
], function(
	jQuery,
	lodash,
	compatibility,
	ViewList,
	ViewTableFilter,
	ViewTableSorter,
	ViewTableCustomizer
)
{
	/**
	 * table of view
	 *
	 * @event {void} sorter:create:before({ViewTable} viewTable, {Object} viewTableSorterOptions) will be triggered directly before the sorter will be created
	 * @event {void} sorter:create:after({ViewTable} viewTable, {ViewTableSorter} viewTableSorter) will be triggered directly after the sorter was created
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
		 * defines that ViewTableCustomizer automatically should be instanciated
		 *
		 * @var {Object}
		 */
		autoCustomize:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * this is the css class name for hover over column and to define the colors
		 *
		 * @var {String}
		 */
		classNameColumnHover:
		{
			value: 'hoverColumn',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines some options for the ViewTableCustomizer
		 * the options will be mapped 1:1 to ViewTableCustomizer
		 *
		 * @var {Object}
		 */
		customizerOptions:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines url prefox for the ViewTableCustomizer
		 *
		 * @var {Object}
		 */
		customizerUrlPrefix:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the global unique name. this is required,
		 * 	- if property autoCustomize is true or
		 * 	- if property autoCustomize is false and property customizerOptions is an object
		 *
		 * @var {String}
		 */
		name:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

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
		 * object of sorter options. if sorterOptions is null, no filter will be rendered
		 * this will be deligated to the ViewTableCustomizer
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
		},

		/**
		 * a view for customizing
		 *
		 * @var {ViewListCustomizer}
		 */
		viewCustomizer:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * creates the customizer view
	 *
	 * @param {Object} options
	 * @returns {ViewTableCustomizer}
	 */
	ViewTable.prototype.createViewCustomizer = function(options)
	{
		if (ViewTableCustomizer === undefined)
		{
			ViewTableCustomizer = require('forge/backbone/view/table/customizer');
		}

		return new ViewTableCustomizer(options);
	};

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

		// trigger 'sorter:create:before' to inform all, that a sorter will be created
		this.trigger('sorter:create:before', this, options);

		var sorter = new ViewTableSorter(options);

		// trigger 'sorter:create:after' to inform all, that a sorter was created
		this.trigger('sorter:create:after', this, sorter);

		return sorter;
	};

	/**
	 * returns the parent element for loading
	 *
	 * @param {Boolean} throwError default TRUE
	 * @returns {jQuery}
	 */
	ViewTable.prototype.getElementContainerLoading = function(throwError)
	{
		var elementParent = null;
		if (this.$el === null)
		{
			return undefined;
		}

		// loading screen container is defined
		if (this.selectorLoading !== null && this.selectorLoading !== undefined)
		{
			elementParent = this.$el.find(this.selectorLoading);
		}

		// not found or not defined with selector start on this $el. maybe this.$el is the selector for loading element
		if ((elementParent === null || elementParent.length === 0) && this.$el.is(this.selectorLoading) === true)
		{
			elementParent = this.$el;
		}

		// not found or not defined find next scrolling element
		if (elementParent === null || elementParent.length === 0)
		{
			elementParent = this.$el.parents().filter(function()
			{
				return jQuery(this).css('overflow-y') !== 'visible';
			}).first();
		}

		// not found or not defined take the container
		if (elementParent === null || elementParent.length === 0)
		{
			elementParent = this.getElementContainerEntry(false) || this.$el;
		}

		return elementParent;
	};

	/**
	 * remove
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.remove = function()
	{
		this.removeCustomizer();

		ViewList.prototype.remove.call(this);

		return this;
	};

	/**
	 * remove a customizer view
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.removeCustomizer = function()
	{
		if (this.viewCustomizer !== null && this.viewCustomizer !== undefined)
		{
			this.viewCustomizer.off(undefined, undefined, this);
			this.viewCustomizer.remove();
			this.viewCustomizer = null;
		}

		return this;
	};

	/**
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderColumnPosition = function()
	{
		var elementDataModels = this.$el.find('thead th');
		var elementColumnsLength = elementDataModels.length;
		var elementColumn = undefined;
		var positionOriginal = undefined;

		var i = undefined;
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = elementDataModels.eq(i);
			positionOriginal = elementColumn.attr('data-column-position');
			if (positionOriginal === undefined)
			{
				elementColumn.attr('data-column-position', i);
			}
		}

		return this;
	};

	/**
	 * renders the customizer
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderCustomizer = function()
	{
		if (this.autoCustomize === false && (this.customizerOptions instanceof Object) === false)
		{
			return this;
		}

		console.debug('creating customizer for table "' + this.name + '".');
		// options
		var self = this;
		var options = lodash.extend(
		{
			autoRender: true,
			viewTable: this,
			urlPrefix: this.customizerUrlPrefix,
			sorterOptions: this.sorterOptions,
			once:
			{
				columnsFetched: function(viewCustomizer)
				{
					self.viewCustomizer = viewCustomizer;
					self.renderRequirementsFinished();
				}
			}
		}, this.customizerOptions || {});

		// create the view
		this.viewCustomizer = this.createViewCustomizer(options);

		return this;
	};

	/**
	 * makes hover for columns
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderHoverColumn = function()
	{
		if (this.classNameColumnHover === null || this.classNameColumnHover === undefined)
		{
			return this;
		}

		var self = this;
		var elementTable = this.$el.find('table');

		// bind to every th and td to set hover class
		elementTable.delegate('th, td', 'mouseover mouseout', function(event)
		{
			var index = jQuery(this).index() + 1;

			var elementCells = elementTable.find('tr th:nth-child(' + index + '), tr td:nth-child(' + index + ')');
			if (event.type == 'mouseover')
			{
				elementCells.addClass(self.classNameColumnHover);
			}
			else
			{
				elementCells.removeClass(self.classNameColumnHover);
			}
		});

		return this;
	};

	/**
	 * if a customizer should be used, then the table must wait for the customizer load to columns config
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderRequirements = function()
	{
		this.renderHoverColumn().renderColumnPosition();

		if (this.autoCustomize === false && (this.customizerOptions instanceof Object) === false)
		{
			return ViewList.prototype.renderRequirements.call(this);
		}

		// render customizer
		this.renderCustomizer();

		return this;
	};

	/**
	 * render some requirements
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderRequirementsFinished = function()
	{
		ViewList.prototype.renderRequirementsFinished.apply(this, arguments);

		this.renderTable();

		return this;
	};

	/**
	 * renders a sorter view for list with given options
	 * if not options defined no sorter will be rendered
	 * this sorter will only be rendered if no customizer is defined
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
	 * render some table specific stuff
	 *
	 * @returns {ViewTable}
	 */
	ViewTable.prototype.renderTable = function()
	{
		this.updateDataAttributes();

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
				elementDataModel = elementDataModels.eq(i);
				elementDataModelPropertyName = elementDataModel.attr('data-model');

				elementDataModel.attr('data-type', modelAttributeTypes[elementDataModelPropertyName]);
			}
		}

		return this;
	};

	return compatibility(ViewTable);
});

'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'forge/backbone/view/table'
], function(
	lodash,
	jQuery,
	compatibility,
	Collection,
	View,
	ViewList,
	ViewTable
)
{
	/**
	 * view table sorted
	 *
	 * @param {Object} Options
	 */
	function ViewTableSorter(options)
	{
		if (ViewList === undefined)
		{
			ViewList = require('forge/backbone/view/list');
		}

		if (ViewTable === undefined)
		{
			ViewTable = require('forge/backbone/view/table');
		}

		View.apply(this, arguments);

		// validate
		if ((this.view instanceof ViewTable) === false && (this.view instanceof ViewList) === false)
		{
			throw new Error('For a table sorter must be the view property a instance of ViewTable!');
		}

		// validate
		if ((this.collection instanceof Collection) === false)
		{
			throw new Error('No collection is defined to sort or collection must be instance of Collection.');
		}

		// set element container that is it sortable
		this.$element.addClass('sortable');

		// bind sort
		lodash.each(this.$element.find('[data-model-sort]'), function(element)
		{
			element = jQuery(element);
			var propertyName = element.data('model-sort');

			element.attr(this.selectorDataModel.slice(1, -1), propertyName);

			element.on('click', this.onClick.bind(this, propertyName));
		}, this);

		// set sort by html
		var elementToSort = this.$element.find('[data-model-sorted]');
		var propertyNameToSort = elementToSort.data('model-sort');
		if (propertyNameToSort !== undefined)
		{
			this.collection.comparator = propertyNameToSort;
			this.collection.direction = elementToSort.data('model-sorted') || Collection.DIRECTION_ASC;
		}

		// show sorting
		this.showSortedProperty(true);

		// events
		this.collection.on('add', this.showSortedProperty.bind(this, true), this);
		this.collection.on('reset', this.showSortedProperty.bind(this, true), this);
		this.view.on('renderEntry', this.updateSortedColumn, this);
	}

	// prototype
	ViewTableSorter.prototype = Object.create(View.prototype,
	{
		/**
		 * collection for sort
		 *
		 * @var {Collection}
		 */
		autoRender:
		{
			value: false,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * collection for sort
		 *
		 * @var {Collection}
		 */
		collection:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this.view.collection;
			}
		},

		/**
		 * @returns {jQuery}
		 */
		$element:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._element === undefined)
				{
					if (this.view.$el.is(this.selector) === true)
					{
						this._element = this.view.$el.find(this.selector);
					}
					else
					{
						this._element = this.view.$el.find(this.selector);
					}
				}

				return this._element;
			}
		},

		/**
		 * selector for elements
		 *
		 * @var {String}
		 */
		selector:
		{
			value: 'thead',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * selector for elements
		 *
		 * @var {String}
		 */
		selectorBody:
		{
			value: 'tbody',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * selector for elements
		 *
		 * @var {String}
		 */
		selectorFooter:
		{
			value: 'tfoot',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * returns the selector for data model elements for this view
		 *
		 * @returns {String}
		 */
		selectorDataModel:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return '[data-model-view-' + this.cid + ']';
			}
		},

		/**
		 * @var {Number}
		 */
		sortedColumnIndex:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * view to sort
		 *
		 * @var {ViewTable}
		 */
		view:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * on click to sort or to toggle the direction
	 *
	 * @param {String} propertyName
	 * @param {jQuery.Event} event
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.onClick = function(propertyName, event)
	{
		event.stop();

		var columnChanged = false;

		// toggle direction
		if (this.collection.comparator === propertyName)
		{
			this.collection.direction = this.collection.direction === Collection.DIRECTION_ASC ? Collection.DIRECTION_DESC : Collection.DIRECTION_ASC;
		}
		// set new sort column
		else
		{
			this.collection.comparator = propertyName;
			columnChanged = true;
		}

		this.showSortedProperty(columnChanged);

		return this;
	};

	/**
	 * remove
	 *
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.remove = function()
	{
		this.collection.off(null, null, this);

		// nothing to do
		return this;
	};

	/**
	 * render
	 *
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.render = function()
	{
		// nothing to do
		return this;
	};

	/**
	 * set sorting in view
	 *
	 * @param {Boolean} columnChanged
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.showSortedProperty = function(columnChanged)
	{
		// column not changed only change direction
		if (columnChanged === false)
		{
			this.$element.find('.sorted' + this.selectorDataModel).removeClass(Collection.DIRECTION_ASC + ' ' + Collection.DIRECTION_DESC).addClass(this.collection.direction);
			return this;
		}

		// everything is changing
		this.$element.find(this.selectorDataModel).removeClass('sorted ' + Collection.DIRECTION_ASC + ' ' + Collection.DIRECTION_DESC);
		this.$element.find(this.selectorDataModel.slice(0, -1) + '=' + this.collection.comparator + ']').addClass('sorted ' + this.collection.direction);

		// find column to highlight in body
		this.sortedColumnIndex = null;
		lodash.find(this.$element.find('th'), function(element, index)
		{
			if (jQuery(element).hasClass('sorted') === true)
			{
				this.sortedColumnIndex = index;
				return true;
			}
		}, this);

		this.updateSortedColumn();

		return this;
	};

	/**
	 * updates sorted column index
	 *
	 * @param {ViewTable} viewTable,
	 * @param {ViewListEntry} viewListEntry
	 * @param {Model} model
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.updateSortedColumn = function(viewTable, viewListEntry, model)
	{
		var viewToHandle = this.view;

		// body
		var selectorPrefix = this.selectorBody + ' tr ';

		// only on one entry
		if (viewListEntry !== undefined)
		{
			viewToHandle = viewListEntry;
			selectorPrefix = '';
		}

		viewToHandle.$el.find(selectorPrefix + 'td.sorted').removeClass('sorted');
		if (this.sortedColumnIndex !== null)
		{
			viewToHandle.$el.find(selectorPrefix + 'td:nth-child(' + (this.sortedColumnIndex + 1) + ')').addClass('sorted');
		}

		// footer
		var selectorPrefix = this.selectorFooter + ' tr ';

		// only on one entry
		if (viewListEntry !== undefined)
		{
			viewToHandle = viewListEntry;
			selectorPrefix = '';
		}

		viewToHandle.$el.find(selectorPrefix + 'th.sorted').removeClass('sorted');
		if (this.sortedColumnIndex !== null)
		{
			viewToHandle.$el.find(selectorPrefix + 'th:nth-child(' + (this.sortedColumnIndex + 1) + ')').addClass('sorted');
		}

		return this;
	};

	return compatibility(ViewTableSorter);
});

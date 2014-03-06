'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/collator',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'forge/backbone/view/table'
], function(
	lodash,
	jQuery,
	collator,
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
	 * @returns {ViewTableSorter}
	 */
	var ViewTableSorter = function(options)
	{
		View.apply(this, arguments);

		// validate
		if ((this.view instanceof ViewTable) === false && (this.view instanceof ViewList) === false)
		{
			throw new Error('For a table sorter must be the view property a instance of ViewList or ViewTable!');
		}

		// validate
		if ((this.collection instanceof Collection) === false)
		{
			throw new Error('No collection is defined to sort or collection must be instance of Collection.');
		}

		// set current sort property
		if (this.current === null && typeof this.collection.comparator === 'string')
		{
			this.current = this.collection.comparator
		}

		// default first attributes from model
		if (this.current === null)
		{
			this.current = lodash.keys(this.collection.prototype.model.defaults)[0];
		}

		// set comparator
		this.collection.comparator = this.comparator.bind(this);

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
		var direction = elementToSort.data('model-sorted') || 'asc';
		var propertyNameToSort = elementToSort.data('model-sort');
		if (propertyNameToSort !== undefined)
		{
			this.current = propertyNameToSort;
			this.direction = direction == 'desc' ? 'desc' : 'asc';
			this.collection.sort();
		}

		// show sorting
		this.showSortedProperty(true);

		this.collection.on('add', this.showSortedProperty.bind(this, true), this);
		this.collection.on('reset', this.showSortedProperty.bind(this, true), this);

		return this;
	};

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
		 * current sort property
		 *
		 * @var {String}
		 */
		current:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * current direction
		 *
		 * @var {String}
		 */
		direction:
		{
			value: 'asc',
			enumerable: true,
			configurable: true,
			writable: true
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
	 * comparator function
	 *
	 * @param {Model} modelA
	 * @param {Model} modelB
	 * @returns {Number}
	 */
	ViewTableSorter.prototype.comparator = function(modelA, modelB)
	{
		return collator.compareModels(this.current, modelA, modelB, this.direction);
	};

	/**
	 * on click to sort or to toggle the direction
	 *
	 * @param {String} propertyName
	 * @param {jQuery.Event} event
	 * @returns {ViewListSorter}
	 */
	ViewTableSorter.prototype.onClick = function(propertyName, event)
	{
		event.stop();

		var columnChanged = false;

		// toggle direction
		if (this.current === propertyName)
		{
			this.direction = this.direction === 'asc' ? 'desc' : 'asc';
		}
		// set new sort column
		else
		{
			this.current = propertyName;
			columnChanged = true;
		}

		this.showSortedProperty(columnChanged).collection.sort();

		return this;
	};

	/**
	 * remove
	 *
	 * @returns {ViewListSorter}
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
	 * @returns {ViewListSorter}
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
			this.$element.find('.sorted' + this.selectorDataModel).removeClass('asc desc').addClass(this.direction);
			return this;
		}

		// everything is changing
		this.$element.find(this.selectorDataModel).removeClass('sorted asc desc');
		this.$element.find(this.selectorDataModel.slice(0, -1) + '=' + this.current + ']').addClass('sorted ' + this.direction);

		// find column to highlight in body
		var sortedColumnIndex = undefined;
		lodash.find(this.$element.find('th'), function(element, index)
		{
			if (jQuery(element).hasClass('sorted') === true)
			{
				sortedColumnIndex = index;
				return true;
			}
		});

		this.view.$el.find(this.selectorBody + ' tr td.sorted').removeClass('sorted');
		if (sortedColumnIndex !== null)
		{
			this.view.$el.find(this.selectorBody + ' tr td:nth-child(' + (sortedColumnIndex + 1) + ')').addClass('sorted');
		}

		return this;
	};

	return 	compatibility(ViewTableSorter);
});

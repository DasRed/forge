'use strict';

define(
[
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'forge/backbone/view/table',
	'tpl!forge/backbone/view/table/sorter/template/sorterHandle',
], function(
	lodash,
	compatibility,
	Collection,
	View,
	ViewList,
	ViewTable,
	tplViewTableSorterTemplateSorterHandle
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

		// copy options from view
		this.selectorDataModelAttributeName = this.view.selectorDataModelAttributeName;
		this.selectorDataModel = this.view.selectorDataModel;
		this.collection = this.view.collection;
		// find element
		this.elementSort = this.view.el.querySelector(this.selector);

		// validate
		if ((this.collection instanceof Collection) === false)
		{
			throw new Error('No collection is defined to sort or collection must be instance of Collection.');
		}

		// set element container that is it sortable
		this.elementSort.closest('table').classList.add('sortable');

		// bind sort
		var elementToSort = undefined;
		var elementsSort = this.elementSort.querySelectorAll('[data-model-sort]');
		var elementsSortLength = elementsSort.length;
		var propertyNameToSort = undefined;
		var tplViewTableSorterTemplateSorterHandleString = tplViewTableSorterTemplateSorterHandle();
		var i = undefined;

		// sorting is defined by template with data-model-sort attribute
		if (elementsSortLength !== 0)
		{
			for (i = 0; i < elementsSortLength; i++)
			{
				elementToSort = elementsSort[i];
				if (elementToSort.getAttribute('data-model-sortable') !== 'false')
				{
					elementToSort.insertAdjacentHTML('beforeEnd', tplViewTableSorterTemplateSorterHandleString);
					elementToSort.addEventListener('click', this.onClick.bind(this, elementToSort.getAttribute('data-model-sort')));
				}
			}
		}

		// sorting is not defined by template with data-model-sort attribute. sort all columns with this.selectorDataModel
		else
		{
			elementsSort = this.elementSort.querySelectorAll(this.selectorDataModel);
			elementsSortLength = elementsSort.length;
			for (i = 0; i < elementsSortLength; i++)
			{
				elementToSort = elementsSort[i];
				if (elementToSort.getAttribute('data-model-sortable') !== 'false')
				{
					propertyNameToSort = elementToSort.getAttribute('data-model');
					elementToSort.setAttribute('data-model-sort', propertyNameToSort);
					elementToSort.insertAdjacentHTML('beforeEnd', tplViewTableSorterTemplateSorterHandleString);
					elementToSort.addEventListener('click', this.onClick.bind(this, propertyNameToSort));
				}
			}
		}

		var propertyNameToSort = undefined;
		var directionToSort = undefined;

		// take sorting informations from options
		if (options.propertyNameToSort !== undefined)
		{
			propertyNameToSort = options.propertyNameToSort;
		}
		if (options.directionToSort !== undefined)
		{
			directionToSort = options.directionToSort;
		}

		// set sort by html
		if (propertyNameToSort === undefined || directionToSort === undefined)
		{
			elementToSort = this.elementSort.querySelector('[data-model-sorted]');
			propertyNameToSort = propertyNameToSort || elementToSort !== null ? elementToSort.getAttribute('data-model-sort') : undefined;
			directionToSort = directionToSort || elementToSort !== null ? elementToSort.getAttribute('data-model-sorted') : undefined;
		}

		// set founded values for sorting
		this.collection.comparator = propertyNameToSort || this.collection.comparator;
		this.collection.direction = directionToSort || this.collection.direction || Collection.DIRECTION_ASC;

		// show sorting
		this.showSortedProperty(true);

		// events
		this.collection.on('add', this.showSortedProperty.bind(this, true), this);
		this.collection.on('reset', this.showSortedProperty.bind(this, true), this);
		this.collection.on('sort', this.showSortedProperty.bind(this, true), this);
		this.view.on('renderEntry', this.renderEntry, this);
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
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @returns {Element}
		 */
		elementSort:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
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
	 * @param {String} propertyNameNew
	 * @param {Event} event
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.onClick = function(propertyNameNew, event)
	{
		var eventTarget = event.target;

		if (eventTarget.matches('th[data-model-sort], .sorterHandle') === false)
		{
			return this;
		}

		var columnChanged = false;

		var propertyNameOld = this.collection.comparator;
		var directionOld = this.collection.direction;
		var directionNew = directionOld;

		// toggle direction
		if (propertyNameOld === propertyNameNew)
		{
			directionNew = directionOld === Collection.DIRECTION_ASC ? Collection.DIRECTION_DESC : Collection.DIRECTION_ASC;
			this.collection.direction = directionNew;
		}
		// set new sort column
		else
		{
			this.collection.comparator = propertyNameNew;
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
	 * render entry
	 *
	 * @param {ViewTable} viewTable,
	 * @param {ViewListEntry} viewTableEntry
	 * @param {Model} model
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.renderEntry = function(viewTable, viewTableEntry, model)
	{
		return this.updateSortedColumn(viewTable, viewTableEntry, model);
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
			var elementSorted = this.elementSort.querySelector('.sorted' + this.selectorDataModel);
			elementSorted.classList.remove(Collection.DIRECTION_ASC, Collection.DIRECTION_DESC);
			elementSorted.classList.add(this.collection.direction);
			return this;
		}

		// everything is changing
		var elements = this.elementSort.querySelectorAll(this.selectorDataModel);
		for (var i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList.remove('sorted', Collection.DIRECTION_ASC, Collection.DIRECTION_DESC);
		}

		var elementSortShowSort = this.elementSort.querySelector('[' + this.selectorDataModelAttributeName + '=' + this.collection.comparator + ']');
		if (elementSortShowSort !== undefined && elementSortShowSort !== null)
		{
			elementSortShowSort.classList.add('sorted', this.collection.direction);
		}

		// find column to highlight in body
		this.sortedColumnIndex = null;
		elements = this.elementSort.querySelectorAll('th');
		for (i = 0, length = elements.length; i < length && this.sortedColumnIndex === null; i++)
		{
			if (elements[i].classList.contains('sorted') === true)
			{
				this.sortedColumnIndex = elements[i].getAttribute('data-column-position');
			}
		}

		this.updateSortedColumn();

		return this;
	};

	/**
	 * updates sorted column index
	 *
	 * @param {ViewTable} viewTable,
	 * @param {ViewListEntry} viewTableEntry
	 * @param {Model} model
	 * @returns {ViewTableSorter}
	 */
	ViewTableSorter.prototype.updateSortedColumn = function(viewTable, viewTableEntry, model)
	{
		var viewToHandle = this.view;

		// body
		var selectorPrefix = this.selectorBody + ' tr ';

		// only on one entry
		if (viewTableEntry !== undefined)
		{
			viewToHandle = viewTableEntry;
			selectorPrefix = '';
		}

		var elements = viewToHandle.el.querySelectorAll(selectorPrefix + 'td.sorted');
		for (var i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList.remove('sorted');
		}

		if (this.sortedColumnIndex !== null)
		{
			elements = viewToHandle.el.querySelectorAll(selectorPrefix + 'td[data-column-position="' + this.sortedColumnIndex + '"]');
			for (i = 0, length = elements.length; i < length; i++)
			{
				elements[i].classList.add('sorted');
			}
		}

		// footer
		selectorPrefix = this.selectorFooter + ' tr ';

		// only on one entry
		if (viewTableEntry !== undefined)
		{
			viewToHandle = viewTableEntry;
			selectorPrefix = '';
		}

		elements = viewToHandle.el.querySelectorAll(selectorPrefix + 'th.sorted');
		for (i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList.remove('sorted');
		}
		if (this.sortedColumnIndex !== null)
		{
			elements = viewToHandle.el.querySelectorAll(selectorPrefix + 'th[data-column-position="' + this.sortedColumnIndex + '"]');
			for (i = 0, length = elements.length; i < length; i++)
			{
				elements[i].classList.add('sorted');
			}
		}

		return this;
	};

	return compatibility(ViewTableSorter);
});

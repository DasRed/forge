'use strict';
define(
[
	'lodash',
	'jQuery',
	'forge/cache/backbone/collection/instance',
	'forge/backbone/compatibility',
	'forge/backbone/view',
	'forge/backbone/view/table/customizer/collection/columns',
	'tpl!forge/backbone/view/table/customizer/template/dragHandle',
	'tpl!forge/backbone/view/table/customizer/template/visibilityHandle',
	'tpl!forge/backbone/view/table/customizer/template/visibilitySelector'
], function(
	lodash,
	jQuery,
	cacheBackboneCollection,
	compatibility,
	View,
	ViewTableCustomizerCollectionColumns,
	tplViewTableCustomizerTemplateDragHandle,
	tplViewTableCustomizerTemplateVisibilityHandle,
	tplViewTableCustomizerTemplateVisibilitySelector
)
{
	var tplViewTableCustomizerTemplateVisibilityHandleString = tplViewTableCustomizerTemplateVisibilityHandle();
	var tplViewTableCustomizerTemplateDragHandleString = tplViewTableCustomizerTemplateDragHandle();

	/**
	 * collect all elements in a tr and reorder an entry to an index
	 *
	 * @param {NodeList} elementDataModels
	 * @param {ViewTableCustomizer} viewCustomizer
	 * @param {Element} elementParent
	 */
	function updateElements(elementDataModels, viewCustomizer, elementParent)
	{
		var elementColumn = undefined;
		var positionOriginal = undefined;

		if (elementParent.tagName.toLowerCase() !== 'tr')
		{
			elementParent = elementParent.querySelector('tr');
		}

		for (var i = 0, length = elementDataModels.length; i < length; i++)
		{
			elementColumn = elementDataModels[i];

			// set original position
			positionOriginal = elementColumn.getAttribute('data-column-position');
			updateElementToCorrectPositionAndVisibility(viewCustomizer, elementParent, elementColumn, positionOriginal);
		}
	}

	/**
	 * reorder an entry to an index if the entry is not an td or th, then the closest th or td parent will be taken
	 *
	 * @param {ViewTableCustomizer} viewCustomizer
	 * @param {Element} elementParent
	 * @param {Element} elementToAppend
	 * @param {Number} positionOriginal
	 */
	function updateElementToCorrectPositionAndVisibility(viewCustomizer, elementParent, elementToAppend, positionOriginal)
	{
		var modelColumn = viewCustomizer.collectionColumns.find(function(modelColumnToTest)
		{
			return modelColumnToTest.attributes.positionOriginal == positionOriginal;
		});
		if (modelColumn === undefined)
		{
			return;
		}

		if (elementToAppend.tagName.toLowerCase() !== 'td' && elementToAppend.tagName.toLowerCase() !== 'th')
		{
			var element = elementToAppend.closest('td');
			if (element === null)
			{
				throw new Error('Can not move element in columns to other position. Can not find the TD or TH element.');
			}
			elementToAppend = element;
		}

		// display column or not
		if (modelColumn.attributes.visible === true)
		{
			elementToAppend.classList.remove('hidden');
		}
		else if (modelColumn.attributes.visible === false)
		{
			elementToAppend.classList.add('hidden');
		}

		var elementChilds = elementParent.childNodes;
		if (elementChilds[modelColumn.attributes.positionCurrent] === elementToAppend)
		{
			return;
		}

		// remove elementToAppend from DOM
		elementToAppend.parentNode.removeChild(elementToAppend);

		// remove elementToAppend from elementChilds
		elementChilds = elementParent.childNodes;

		// append
		if (elementChilds.length == 0 || elementChilds.length - 1 <= modelColumn.attributes.positionCurrent)
		{
			elementParent.appendChild(elementToAppend);
		}
		// insert at position
		else
		{
			elementParent.insertBefore(elementToAppend, elementChilds[modelColumn.attributes.positionCurrent]);
		}
	}

	/**
	 * table structure
	 *
	 * @event {void} columnsFetched({ViewTableCustomizer}) will be fired if the column informations are fetched from the server
	 * @param {Object} options
	 */
	function ViewTableCustomizer(options)
	{
		// this function will be used as callback function... so prebind it to this
		this.removeVisibilitySelector = this.removeVisibilitySelector.bind(this);

		View.apply(this, arguments);
	}

	// prototype
	ViewTableCustomizer.prototype = Object.create(View.prototype,
	{

		/**
		 * drag handle css class name
		 *
		 * @var {String}
		 */
		classNameDragHandle:
		{
			value: 'dragHandle',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * visibility handle css class name
		 *
		 * @var {String}
		 */
		classNameVisibilityHandle:
		{
			value: 'visibilityHandle',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * visibility selector css class name
		 *
		 * @var {String}
		 */
		classNameVisibilitySelector:
		{
			value: 'visibilitySelector',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * collection of columns
		 *
		 * @var {ViewTableCustomizerCollectionColumns}
		 */
		collectionColumns:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._collectionColumns || null;
			},
			set: function(collectionColumns)
			{
				if (this.preInitialized === false)
				{
					this._collectionColumns = collectionColumns;
					return;
				}

				if (collectionColumns === null || collectionColumns === undefined)
				{
					throw new Error('ColumnsCollection can not be undefined for a ViewTableCustomizer');
				}

				// remove old events
				if (this._collectionColumns instanceof ViewTableCustomizerCollectionColumns)
				{
					this._collectionColumns.off(null, null, this);
				}

				// get the instance
				if ((collectionColumns instanceof ViewTableCustomizerCollectionColumns) === false)
				{
					if (this.collectionColumnsCachingEnabled === true)
					{
						collectionColumns = cacheBackboneCollection.getInstance(collectionColumns,
						{
							table: this.viewTable.name,
							urlPrefix: this.urlPrefix
						});
					}
					else
					{
						collectionColumns = new collectionColumns(undefined,
						{
							table: this.viewTable.name,
							urlPrefix: this.urlPrefix
						});
					}
				}

				this._collectionColumns = collectionColumns;
			}
		},

		/**
		 * cache collectionColumns and try to find them in cache. if not they will be stored in cache
		 * @var {Boolean}
		 */
		collectionColumnsCachingEnabled:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * element of the table to use
		 *
		 * @var {Element}
		 */
		elementTable:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * element of the table thead to use
		 *
		 * @var {Element}
		 */
		elementTableThead:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 *  element of the table thead first tr to use
		 *
		 * @var {Element}
		 */
		elementTableTheadTr:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * elements of all columns in table > thead > tr:first
		 *
		 * @var {Element}
		 */
		elementTableTheadTrColumns:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * rendered tplViewTableCustomizerTemplateVisibilitySelector
		 *
		 * @var {Element}
		 */
		elementVisibilitySelector:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * table to customize. This value is required
		 *
		 * @var {ViewTable}
		 */
		viewTable:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * url prefix for all models and collectionColumns for columns
		 *
		 * @var {String}
		 */
		urlPrefix:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * use the visibility handle as drag handle
		 *
		 * @var {Boolean}
		 */
		useVisibilityHandleAsDragHandle:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * creates the drag and drop
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.createDragable = function()
	{
		// bind drag and drop
		jQuery(this.elementTable).dragtable(
		{
			dragHandle: '.' + this.classNameDragHandle,
			revert: 300,
			tolerance: 'intersect',
			clickDelay: 250,
			persistState: this.onDragFinished.bind(this)
		});

		return this;
	};

	/**
	 * onclick for visibility handler
	 * @param {Event} event
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onClickVisibilityHandle = function(event)
	{
		var elementVisibilityHandle = event.target;
		var i;
		var length;

		// prerender template for selection
		if (this.elementVisibilitySelector === null)
		{
			var elementHelper = document.createElement('div');
			elementHelper.insertAdjacentHTML('afterBegin', tplViewTableCustomizerTemplateVisibilitySelector(
			{
				view: this
			}));
			this.elementVisibilitySelector = elementHelper.childNodes[0];
			elementHelper.removeChild(this.elementVisibilitySelector);
			elementHelper = null;

			var elements = this.elementVisibilitySelector.querySelectorAll('[type=checkbox]');
			for (i = 0, length = elements.length; i < length; i++)
			{
				elements[i].addEventListener('click', this.onClickVisibilitySelector.bind(this));
			}
			document.addEventListener('click', this.removeVisibilitySelector);
		}

		// click to remove
		if (this.elementVisibilitySelector.parentNode !== null && this.elementVisibilitySelector.nextSibling === elementVisibilityHandle)
		{
			this.removeVisibilitySelector();
			return this;
		}

		// prepare element
		var elementCheckboxChecked = this.elementVisibilitySelector.querySelectorAll('input[type=checkbox][data-customizer-property]:checked');
		var stateDisabled = (elementCheckboxChecked.length === 1);
		for (i = 0, length = elementCheckboxChecked.length; i < length; i++)
		{
			elementCheckboxChecked[i].disabled = stateDisabled;
		}
		this.elementVisibilitySelector.classList.remove('show');
		lodash.defer(function(element)
		{
			element.classList.add('show');
		}, this.elementVisibilitySelector);

		// append element
		elementVisibilityHandle.parentNode.insertBefore(this.elementVisibilitySelector, elementVisibilityHandle);

		return this;
	};

	/**
	 * onclick for visibility selector
	 * @param {Event} event
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onClickVisibilitySelector = function(event)
	{
		var elementColumnName = event.target.getAttribute('data-customizer-property');
		var modelColumn = undefined;

		modelColumn = this.collectionColumns.get(elementColumnName);
		if (modelColumn === undefined)
		{
			return this;
		}

		var elementColumn = event.target.closest('th[' + this.viewTable.selectorDataModelAttributeName + '="' + elementColumnName + '"]');

		var elementCheckbox = this.elementVisibilitySelector.querySelector('input[type=checkbox][data-customizer-property="' + elementColumnName + '"]');

		modelColumn.attributes.visible = elementCheckbox.checked;//!modelColumn.attributes.visible;

		var elementCheckboxChecked = this.elementVisibilitySelector.querySelectorAll('input[type=checkbox][data-customizer-property]:checked');
		var stateDisabled = (elementCheckboxChecked.length === 1);
		for (var i = 0, length = elementCheckboxChecked.length; i < length; i++)
		{
			elementCheckboxChecked[i].disabled = stateDisabled;
		}

		// remove current
		if (elementColumn === this.elementVisibilitySelector.closest('th'))
		{
			this.removeVisibilitySelector();
		}

		this.collectionColumns.save();
		this.update();

		return this;
	};

	/**
	 * on fetching the collectionColumns
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onCollectionColumnsFetched = function()
	{
		console.debug('columns collection fetched for table "' + this.viewTable.name + '".');

		// find all columns
		var elementColumnsLength = this.elementTableTheadTrColumns.length;
		var elementColumn = undefined;
		var elementColumnName = undefined;
		var modelColumn = undefined;
		var collectionColumnsMustBeSynced = false;
		var i = 0;
		//var sortComparator = undefined;
		//var sortDirection = undefined;

		// fill up collectionColumns with not existing columns oir calculate current position and set original position
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = this.elementTableTheadTrColumns[i];
			if (elementColumn.matches(this.viewTable.selectorDataModel) === false)
			{
				continue;
			}
			elementColumnName = elementColumn.getAttribute(this.viewTable.selectorDataModelAttributeName);
			modelColumn = this.collectionColumns.get(elementColumnName);

			// create a none existing column
			if (modelColumn === undefined)
			{
				this.collectionColumns.add(
				{
					table: this.viewTable.name,
					column: elementColumnName,
					positionOriginal: i,
					positionCurrent: i,
					positionRelative: 0,
					visible: true
				});

				collectionColumnsMustBeSynced = true;
			}
			// update attributes on modelColumn
			else
			{
				modelColumn.attributes.positionOriginal = i;
				modelColumn.attributes.positionCurrent = i + modelColumn.attributes.positionRelative;

			//	if (modelColumn.attributes.sorted === true)
			//	{
			//		sortComparator = modelColumn.attributes.column;
			//		sortDirection = modelColumn.attributes.sortDirection;
			//	}
			}
		}

		// save the collectionColumns to server
		if (collectionColumnsMustBeSynced === true)
		{
			this.collectionColumns.save();
		}

		// set correct sorting
		//this.viewTable.collection.comparator = sortComparator;
		//this.viewTable.collection.direction = sortDirection;

		// after once fetching we can bind - bind to sort
		this.collectionColumns.on('sort', this.update, this);

		// update everything
		this.update();

		// bind drag and drop
		this.createDragable();

		// columns information are fetched
		this.trigger('columnsFetched', this);

		return this;
	};

	/**
	 * drag and drop of column is finished
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onDragFinished = function()
	{
		this.elementTableTheadTrColumns = this.elementTableTheadTr.querySelectorAll('th');

		var elementColumnsLength = this.elementTableTheadTrColumns.length;
		var elementColumn = undefined;
		var elementColumnName = undefined;
		var modelColumn = undefined;
		var i = undefined;
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = this.elementTableTheadTrColumns[i];
			if (elementColumn.matches(this.viewTable.selectorDataModel) === false)
			{
				continue;
			}
			elementColumnName = elementColumn.getAttribute(this.viewTable.selectorDataModelAttributeName);

			modelColumn = this.collectionColumns.get(elementColumnName);
			modelColumn.attributes.positionCurrent = i;
			modelColumn.attributes.positionRelative = i - modelColumn.attributes.positionOriginal;
		}

		this.collectionColumns.sort().save();

		return this;
	};

	/**
	 * if the collection sort comparator has changed
	 *
	 * @param {Collection} collection
	 * @param {String} comparatorNew
	 * @param {String} comparatorOld
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onSortComparatorChanged = function(collection, comparatorNew, comparatorOld)
	{
		// disable sort in old model
		var modelOld = this.collectionColumns.get(comparatorOld);
		var modelNew = this.collectionColumns.get(comparatorNew);

		if (modelOld === undefined || modelNew === undefined || modelOld === modelNew || modelNew.attributes.sorted === true)
		{
			return this;
		}

		modelOld.attributes.sorted = false;
		modelNew.attributes.sorted = true;

		this.collectionColumns.save();

		return this;
	};

	/**
	 * if the collection sort direction has changed
	 *
	 * @param {Collection} collection
	 * @param {String} directionNew
	 * @param {String} directionOld
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onSortDirectionChanged = function(collection, directionNew, directionOld)
	{
		// disable sort in old model
		var model = this.collectionColumns.getModelForSorting();

		if (model === undefined || model.attributes.sortDirection === directionNew)
		{
			return this;
		}

		model.attributes.sortDirection = directionNew;

		this.collectionColumns.save();

		return this;
	};

	/**
	 *
	 * @param {Object} options
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.preInitialize = function(options)
	{
		View.prototype.preInitialize.call(this, options);

		// validation
		if (this.viewTable === null || this.viewTable === undefined)
		{
			throw new Error('The property "viewTable" for a ViewTableCustomizer can not be undefined or null.');
		}

		if (this.viewTable.name === null || this.viewTable.name === undefined || this.viewTable.name === '')
		{
			throw new Error('The property "viewTable.name" for a ViewTableCustomizer can not be undefined, empty or null.');
		}

		// should we use the visibility handle also as drag handle?
		if (this.useVisibilityHandleAsDragHandle === true)
		{
			this.classNameDragHandle = this.classNameVisibilityHandle;
		}

		// bind to view Table for renderEntry
		this.viewTable.on('renderEntry', this.updateEntry, this);

		// define the default collectionColumns?
		if (this.collectionColumns === undefined || this.collectionColumns === null)
		{
			this.collectionColumns = ViewTableCustomizerCollectionColumns;
		}

		// find some elements
		this.elementTable = this.viewTable.getElementContainerEntry().closest('table');
		this.elementTableThead = this.elementTable.querySelector('thead');
		this.elementTableTheadTr = this.elementTableThead.querySelector('tr');
		this.elementTableTheadTrColumns = this.elementTableTheadTr.querySelectorAll('th');

		// set element container that is it customizable
		this.elementTableThead.closest('table').classList.add('customizable');

		// inject visibility handle to Columns
		var elementTableTheadTrTh = this.elementTableTheadTr.querySelectorAll('th' + this.viewTable.selectorDataModel);
		for (var i = 0, length = elementTableTheadTrTh.length; i < length; i++)
		{
			elementTableTheadTrTh[i].insertAdjacentHTML('beforeEnd', tplViewTableCustomizerTemplateVisibilityHandleString);

			// should we use a own symbole as drag handle?
			if (this.useVisibilityHandleAsDragHandle === false)
			{
				// inject drag handle to Columns
				elementTableTheadTrTh[i].insertAdjacentHTML('beforeEnd', tplViewTableCustomizerTemplateDragHandleString);
			}
		}

		// bind to handler
		var elements = this.elementTableTheadTr.querySelectorAll('th' + this.viewTable.selectorDataModel + ' .' + this.classNameVisibilityHandle);
		for (i = 0, length = elements.length; i < length; i++)
		{
			elements[i].addEventListener('click', this.onClickVisibilityHandle.bind(this));
		}

		// listen to view table if the view table will be create a view table sorter
		this.viewTable.once('sorter:create:before', function(viewTable, viewTableSorterOptions)
		{
			// then remap the options for default sort
			var modelForSorting = this.collectionColumns.getModelForSorting();
			viewTableSorterOptions.propertyNameToSort = modelForSorting !== undefined ? modelForSorting.attributes.column : undefined;
			viewTableSorterOptions.directionToSort = modelForSorting !== undefined ? modelForSorting.attributes.sortDirection : undefined;
		}, this);

		// listen to view table collection for changes on comparator and direction
		this.viewTable.collection.on('sort:comparator:changed', this.onSortComparatorChanged, this);
		this.viewTable.collection.on('sort:direction:changed', this.onSortDirectionChanged, this);

		// fetch the collectionColumns
		if (this.collectionColumns.length === 0)
		{
			this.collectionColumns.fetch(
			{
				success: this.onCollectionColumnsFetched.bind(this)
			});
		}
		// was fetched
		else
		{
			this.onCollectionColumnsFetched();
		}

		return this;
	};

	/**
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.remove = function()
	{
		this.collectionColumns.off(undefined, undefined, this);
		this.viewTable.collection.off(undefined, undefined, this);
		this.viewTable.off(undefined, undefined, this);

		this.removeVisibilitySelector();

		View.prototype.remove.call(this);

		return this;
	};

	/**
	 * @param {Event} event
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.removeVisibilitySelector = function(event)
	{
		if (event !== undefined)
		{
			var element = event.target;
			if (
				event.target.classList.contains(this.classNameVisibilityHandle) === true ||
				event.target.classList.contains(this.classNameVisibilitySelector) === true ||
				element.closest('.' + this.classNameVisibilitySelector) != null
			)
			{
				//do nothing;
				return this;
			}
		}

		if (this.elementVisibilitySelector !== undefined && this.elementVisibilitySelector !== null)
		{
			this.elementVisibilitySelector.parentNode.removeChild(this.elementVisibilitySelector);
		}
		this.elementVisibilitySelector = null;

		document.removeEventListener('click', this.removeVisibilitySelector);

		return this;
	};

	/**
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.render = function()
	{
		// nothing to do
		return this;
	};

	/**
	 * update the head and entries
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.update = function()
	{
		return this.updateHead().updateEntries();
	};

	/**
	 * update every entry
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.updateEntries = function()
	{
		var tableCollectionLength = this.viewTable.collection.length;
		var viewTableEntry = undefined;

		// update the order of entries in table
		var i = undefined;
		for (i = 0; i < tableCollectionLength; i++)
		{
			viewTableEntry = this.viewTable.getViewEntryByModel(this.viewTable.collection.models[i], false);
			if (viewTableEntry === undefined)
			{
				continue;
			}

			this.updateEntry(this.viewTable, viewTableEntry);
		}

		return this;
	};

	/**
	 * update a entry of the table
	 *
	 * @param {ViewTable} viewTable
	 * @param {ViewTableEntry} viewTableEntry
	 * @param {Model} model 	 ... this parameter comes with the event but are not used
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.updateEntry = function(viewTable, viewTableEntry)
	{
		if (viewTableEntry.el.tagName.toLowerCase() === 'tr')
		{
			updateElements(viewTableEntry.el.querySelectorAll('td'), this, viewTableEntry.el);
			return this;
		}

		var elements = viewTableEntry.el.querySelectorAll('tr');
		for (var i = 0, length = elements.length; i < length; i++)
		{
			updateElements(elements[i].querySelectorAll('td'), this, elements[i]);
		}

		return this;
	};

	/**
	 * update the head
	 *
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.updateHead = function()
	{
		updateElements(this.elementTableTheadTrColumns, this, this.elementTableTheadTr);

		return this;
	};

	return compatibility(ViewTableCustomizer);
});

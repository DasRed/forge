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
	/**
	 * collect all elements in a tr and reorder an entry to an index
	 *
	 * @param {jQuery} elementDataModels
	 * @param {ViewTableCustomizer} viewCustomizer
	 * @param {jQuery} elementParent
	 */
	function updateElements(elementDataModels, viewCustomizer, elementParent)
	{
		var elementColumnsLength = elementDataModels.length;
		var elementColumn = undefined;
		var positionOriginal = undefined;

		var i = undefined;
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = elementDataModels.eq(i);

			// set original position
			positionOriginal = elementColumn.attr('data-customizer-position-original');
			if (positionOriginal === undefined)
			{
				positionOriginal = i;
				elementColumn.attr('data-customizer-position-original', positionOriginal);
			}

			updateElementToCorrectPositionAndVisibility(viewCustomizer, elementParent, elementColumn, positionOriginal);
		}
	}

	/**
	 * reorder an entry to an index if the entry is not an td or th, then the closest th or td parent will be taken
	 *
	 * @param {ViewTableCustomizer} viewCustomizer
	 * @param {jQuery} elementParent
	 * @param {jQuery} elementToAppend
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

		if (elementToAppend.is('td') === false && elementToAppend.is('th') === false)
		{
			var element = elementToAppend.closest('td');
			if (element.length === 0)
			{
				element = elementToAppend.closest('td');
			}
			if (element.length === 0)
			{
				throw new Error('Can not move element in columns to other position. Can not find the TD or TH element.');
			}
			elementToAppend = element;
		}

		// display column or not
		if (modelColumn.attributes.visible === true)
		{
			elementToAppend.removeClass('hidden');
		}
		else if (modelColumn.attributes.visible === false)
		{
			elementToAppend.addClass('hidden');
		}

		var elementChilds = elementParent.find('>');
		if (elementChilds[modelColumn.attributes.positionCurrent] === elementToAppend[0])
		{
			return;
		}

		// remove elementToAppend from DOM
		elementToAppend.detach();

		// remove elementToAppend from elementChilds
		elementChilds = elementParent.find('>');

		// append
		if (elementChilds.length == 0 || elementChilds.length - 1 <= modelColumn.attributes.positionCurrent)
		{
			elementToAppend.appendTo(elementParent);
		}
		// insert at position
		else
		{
			elementToAppend.insertBefore(elementChilds[modelColumn.attributes.positionCurrent]);
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
		this.removeVisibilitySelector = this.removeVisibilitySelector.bind(this);
		View.apply(this, arguments);
	}

	// prototype
	ViewTableCustomizer.prototype = Object.create(View.prototype,
	{
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
		 * jQuery element of the table to use
		 *
		 * @var {jQuery}
		 */
		elementTable:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * jQuery element of the table thead to use
		 *
		 * @var {jQuery}
		 */
		elementTableThead:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * jQuery element of the table thead first tr to use
		 *
		 * @var {jQuery}
		 */
		elementTableTheadTr:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * jQuery elements of all columns in table > thead > tr:first
		 *
		 * @var {jQuery}
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
		 * @var {jQuery}
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
		}
	});

	/**
	 * creates the drag and drop
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.createDragable = function()
	{
		// bind drag and drop
		this.elementTable.dragtable(
		{
			dragHandle:'.dragHandle',
			revert: 300,
			tolerance: 'intersect',

			persistState: this.onDragFinished.bind(this)
		});

		return this;
	};

	/**
	 * onclick for visibility handler
	 * @param {jQuery.Event} event
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onClickVisibilityHandle = function(event)
	{
		var elementVisibilityHandle = jQuery(event.target);

		// prerender template for selection
		if (this.elementVisibilitySelector === null)
		{
			this.elementVisibilitySelector = jQuery(tplViewTableCustomizerTemplateVisibilitySelector(
			{
				view: this
			}));
			this.elementVisibilitySelector.find('[type=checkbox]').on('click', this.onClickVisibilitySelector.bind(this));
			jQuery(document).on('click', this.removeVisibilitySelector);
		}

		// click to remove
		if (this.elementVisibilitySelector.parent().length !== 0 && this.elementVisibilitySelector.next()[0] === elementVisibilityHandle[0])
		{
			this.removeVisibilitySelector();
			return this;
		}

		// prepare element
		var self = this;
		var elementCheckboxChecked = this.elementVisibilitySelector.find('input[type=checkbox][data-customizer-property]:checked');
		if (elementCheckboxChecked.length === 1)
		{
			elementCheckboxChecked.prop('disabled', true);
		}
		else
		{
			elementCheckboxChecked.prop('disabled', false);
		}
		this.elementVisibilitySelector.removeClass('show').delay(0).promise().done(function()
		{
			self.elementVisibilitySelector.addClass('show');
		});

		// append element
		elementVisibilityHandle.before(this.elementVisibilitySelector);

		return this;
	};

	/**
	 * onclick for visibility selector
	 * @param {jQuery.Event} event
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.onClickVisibilitySelector = function(event)
	{
		var elementTarget = jQuery(event.target);
		var elementColumnName = elementTarget.data('customizer-property');
		var modelColumn = undefined;

		modelColumn = this.collectionColumns.get(elementColumnName);
		if (modelColumn === undefined)
		{
			return this;
		}

		var elementColumn = elementTarget.closest('th[' + this.viewTable.selectorDataModelAttributeName + '="' + elementColumnName + '"]');

		var elementCheckbox = this.elementVisibilitySelector.find('input[type=checkbox][data-customizer-property="' + elementColumnName + '"]');
		var elementCheckboxChecked = undefined;

		modelColumn.attributes.visible = elementCheckbox.prop('checked');//!modelColumn.attributes.visible;

		elementCheckboxChecked = this.elementVisibilitySelector.find('input[type=checkbox][data-customizer-property]:checked');
		elementCheckboxChecked.prop('disabled', elementCheckboxChecked.length === 1);

		// remove current
		if (elementColumn[0] === this.elementVisibilitySelector.closest('th')[0])
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

		// fill up collectionColumns with not existing columns oir calculate current position and set original position
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = this.elementTableTheadTrColumns.eq(i);
			if (elementColumn.is(this.viewTable.selectorDataModel) === false)
			{
				continue;
			}
			elementColumnName = elementColumn.attr(this.viewTable.selectorDataModelAttributeName);
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
			}
		}

		// save the collectionColumns to server
		if (collectionColumnsMustBeSynced === true)
		{
			this.collectionColumns.save();
		}

		// after once fetching we can bind
		this.collectionColumns.on('sort', this.update, this);
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
		this.elementTableTheadTrColumns = this.elementTableTheadTr.find('th');

		var elementColumnsLength = this.elementTableTheadTrColumns.length;
		var elementColumn = undefined;
		var elementColumnName = undefined;
		var modelColumn = undefined;
		var i = undefined;
		for (i = 0; i < elementColumnsLength; i++)
		{
			elementColumn = this.elementTableTheadTrColumns.eq(i);
			if (elementColumn.is(this.viewTable.selectorDataModel) === false)
			{
				continue;
			}
			elementColumnName = elementColumn.attr(this.viewTable.selectorDataModelAttributeName);

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

		if (this.viewTable === null || this.viewTable === undefined)
		{
			throw new Error('The property "viewTable" for a ViewTableCustomizer can not be undefined or null.');
		}

		if (this.viewTable.name === null || this.viewTable.name === undefined || this.viewTable.name === '')
		{
			throw new Error('The property "viewTable.name" for a ViewTableCustomizer can not be undefined, empty or null.');
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
		this.elementTableThead = this.elementTable.find('thead');
		this.elementTableTheadTr = this.elementTableThead.find('tr').eq(0);
		this.elementTableTheadTrColumns = this.elementTableTheadTr.find('th');

		// set element container that is it customizable
		this.elementTableThead.closest('table').addClass('customizable');

		this.elementTableTheadTr.find('th' + this.viewTable.selectorDataModel)
			// inject visibility handle to Columns
			.append(tplViewTableCustomizerTemplateVisibilityHandle)
			// inject drag handle to Columns
			.append(tplViewTableCustomizerTemplateDragHandle);

		// bind to handler
		this.elementTableTheadTr.find('th' + this.viewTable.selectorDataModel + ' .visibilityHandle').on('click', this.onClickVisibilityHandle.bind(this));

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
	 * @param {jQuery.Event} event
	 * @returns {ViewTableCustomizer}
	 */
	ViewTableCustomizer.prototype.removeVisibilitySelector = function(event)
	{
		if (event !== undefined)
		{
			var element = jQuery(event.target);
			if (element.hasClass('visibilityHandle') === true || element.hasClass('visibilitySelector') === true || element.closest('.visibilitySelector').length !== 0)
			{
				//do nothing;
				return this;
			}
		}

		if (this.elementVisibilitySelector !== undefined && this.elementVisibilitySelector !== null)
		{
			this.elementVisibilitySelector.remove();
		}
		this.elementVisibilitySelector = null;

		jQuery(document).off('click', this.removeVisibilitySelector);

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
		updateElements(viewTableEntry.$el.find('td'), this, viewTableEntry.$el);

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

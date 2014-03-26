'use strict';

define(
[
	'require',
	'lodash',
	'jQuery',
	'forge/queue/timeout',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/model',
	'forge/backbone/view',
	'forge/backbone/view/list/entry',
	'forge/backbone/view/list/filter',
	'forge/backbone/view/list/sorter'
], function(
	require,
	lodash,
	jQuery,
	QueueTimeout,
	compatibility,
	Collection,
	Model,
	View,
	ViewListEntry,
	ViewListFilter,
	ViewListSorter
)
{
	// Cached regex to split keys for `delegate`.
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	/**
	 * list of view
	 *
	 * @event {void} renderEntry({ViewList} viewList, {ViewListEntry} viewListEntry, {Model} model)
	 * @param {Object} options
	 * @returns {ViewList}
	 */
	var ViewList = function(options)
	{
		options = options || {};

		// take collection from options
		if (options.collection !== undefined)
		{
			this.collection = options.collection;
			delete options.collection;
		}

		// take viewEntry from options
		if (options.viewEntry !== undefined)
		{
			this.viewEntry = options.viewEntry;
			delete options.viewEntry;
		}

		// init
		this.viewEntries = {};
		View.apply(this, arguments);

		// validate
		if (this.collection === null || this.collection === undefined)
		{
			throw new Error('Collection can not be undefined for a view list');
		}

		if (this.viewEntry === null || this.viewEntry === undefined)
		{
			throw new Error('View for an entry can not be undefined for a view list');
		}

		return this;
	};

	// prototype
	ViewList.prototype = Object.create(View.prototype,
	{
		/**
		 * automatic fetching of collection
		 *
		 * @var {Boolean}
		 */
		autoFetch:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * collection to deal with this list
		 *
		 * @var {Collection}
		 */
		collection:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._collection;
			},
			set: function(collection)
			{
				if (collection === null || collection === undefined)
				{
					throw new Error('Collection can not be undefined for a view list');
				}

				// nothing to do
				if (this._collection === collection)
				{
					return;
				}

				// remove old events
				if (this._collection instanceof Collection)
				{
					this._collection.off(null, null, this);
				}

				// get the instance
				if ((collection instanceof Collection) === false)
				{
					collection = new collection();
				}

				// add events
				collection.on('add', this.onCollectionAdd, this);
				collection.on('remove', this.onCollectionRemove, this);
				collection.on('reset', this.onCollectionReset, this);
				collection.on('sort', this.onCollectionSort, this);
				collection.on('fetching', this.showLoadingScreen, this);
				collection.on('fetched', this.hideLoadingScreen, this);

				// fetch the data
				if (this.autoFetch === true && collection.length == 0)
				{
					collection.fetch();
				}

				this._collection = collection;
			}
		},

		/**
		 * object of filter options. if filterOptions is null, no filter will be rendered
		 *
		 * @see ViewListFilter
		 * @var {Object}
		 */
		filterOptions:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * queue for rendering
		 *
		 * @returns {QueueTimeout}
		 */
		renderQueue:
		{
			get: function()
			{
				if (this._renderQueue === undefined)
				{
					this._renderQueue = new QueueTimeout();
				}

				return this._renderQueue;
			}
		},

		/**
		 * css selector for the container which gets all entries append if this is null or undefined
		 * this.$el will be taken
		 *
		 * @var {String}
		 */
		selectorContainer:
		{
			value: '> ul',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * selector for button reload for event
		 *
		 * @var {String}
		 */
		selectorButtonAllEvent:
		{
			value: '.all',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * selector for button reload for event
		 *
		 * @var {String}
		 */
		selectorButtonReloadEvent:
		{
			value: '.reload',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * css selector for the container for loading element. if not defined or found, selectorContainer rules will be taken
		 *
		 * @var {String}
		 */
		selectorLoading:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * show the loading
		 *
		 * @var {Boolean}
		 */
		showLoading:
		{
			value: true,
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
			value: null,
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
			value: 'ul',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * template for loading
		 *
		 * @var {String}
		 */
		templateLoading:
		{
			value: '<div class="loaderScreen"><i class="fa fa-spinner fa-spin"></i></div>',
			enumerable: true,
			configurable: true,
			writabke: true
		},

		/**
		 * @var {View}
		 */
		viewEntry:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._viewEntry;
			},
			set: function(viewEntry)
			{
				if (viewEntry === null || viewEntry === undefined)
				{
					throw new Error('View for an entry can not be undefined for a view list');
				}

				// nothing to do
				if (this._viewEntry === viewEntry)
				{
					return;
				}

				this._viewEntry = viewEntry;
			}
		},

		/**
		 * list of all views for the models
		 *
		 * @var {Object}
		 */
		viewEntries:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * a view for filtering
		 *
		 * @var {ViewListFilter}
		 */
		viewFilter:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * a view for sorting
		 *
		 * @var {ViewListSorter}
		 */
		viewSorter:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * appends more delegated events without removing previous added events
	 *
	 * @param {Object} options
	 * @returns {ViewList}
	 */
	ViewList.prototype.appendDelegateEvents = function(events)
	{
		for (var key in events)
		{
			var method = events[key];
			if ((method instanceof Function) === false)
			{
				method = this[events[key]];
			}
			if ((method instanceof Function) === false)
			{
				continue;
			}

			var match = key.match(delegateEventSplitter);
			var eventName = match[1];
			var selector = match[2];

			method = method.bind(this);
			eventName += '.delegateEvents' + this.cid;
			if (selector === '')
			{
				this.$el.on(eventName, method);
			}
			else
			{
				this.$el.on(eventName, selector, method);
			}
		}

		return this;
	};

	/**
	 * reorder an entry to an index
	 *
	 * @param {Model} model
	 * @param {Number} index
	 * @returns {ViewList}
	 */
	ViewList.prototype.appendEntryToIndex = function(model, index)
	{
		var elementParent = this.getElementContainerEntry();
		var elementEntry = this.getViewEntryByModel(model).$el.detach();
		var elementChilds = elementParent.find('>');

		// append
		if (elementChilds.length == 0 || elementChilds.length - 1 <= index)
		{
			elementEntry.appendTo(elementParent);
		}
		// insert at position
		else
		{
			elementEntry.insertBefore(elementChilds[index]);
		}

		return this;
	};

	/**
	 * creates the filter view
	 *
	 * @param {Object} options
	 * @returns {ViewListFilter}
	 */
	ViewList.prototype.createViewFilter = function(options)
	{
		if (ViewListFilter === undefined)
		{
			ViewListFilter = require('forge/backbone/view/list/filter');
		}

		return new ViewListFilter(options);
	};

	/**
	 * creates the sorter view
	 *
	 * @param {Object} options
	 * @returns {ViewListSorter}
	 */
	ViewList.prototype.createViewSorter = function(options)
	{
		if (ViewListSorter === undefined)
		{
			ViewListSorter = require('forge/backbone/view/list/sorter');
		}

		return new ViewListSorter(options);
	};

	/**
	 * returns the parent element for entries
	 *
	 * @param {Boolean} throwError default TRUE
	 * @returns {jQuery}
	 */
	ViewList.prototype.getElementContainerEntry = function(throwError)
	{
		var elementParent = this.selectorContainer === null || this.selectorContainer === undefined ? this.$el : this.$el.find(this.selectorContainer);
		if (elementParent.length === 0)
		{
			if (throwError === undefined || throwError === true)
			{
				throw new Error('Can not find parent element "' + this.selectorContainer + '" for view list.');
			}
			return undefined;
		}

		return elementParent;
	};

	/**
	 * returns the parent element for loading
	 *
	 * @param {Boolean} throwError default TRUE
	 * @returns {jQuery}
	 */
	ViewList.prototype.getElementContainerLoading = function(throwError)
	{
		var elementParent = null;
		if (this.$el === null)
		{
			return undefined;
		}

		if (this.selectorLoading !== null && this.selectorLoading !== undefined)
		{
			elementParent = this.$el.find(this.selectorLoading);
		}

		if ((elementParent === null || elementParent.length === 0) && this.$el.is(this.selectorLoading) === true)
		{
			elementParent = this.$el;
		}

		if (elementParent === null || elementParent.length === 0)
		{
			elementParent = this.getElementContainerEntry(false) || this.$el;
		}

		return elementParent;
	};

	/**
	 * returns the view for a model
	 *
	 * @param {Model} model
	 * @param {Boolean} throwError Default is TRUE
	 * @returns {View}
	 */
	ViewList.prototype.getViewEntryByModel = function(model, throwError)
	{
		throwError = throwError === undefined ? true : throwError;

		if ((model instanceof Model) === false)
		{
			if (throwError === true)
			{
				throw new Error('Model must be defined!');
			}
			return undefined;
		}

		var id = model.cid;
		if (this.viewEntries[id] === undefined || this.viewEntries[id] === null)
		{
			if (throwError === true)
			{
				throw new Error('Unknown model for view list');
			}
			return undefined;
		}

		return this.viewEntries[id];
	};

	/**
	 * returns the view instance
	 *
	 * @param {Model} model
	 * @param {Object} options
	 * @returns {View}
	 */
	ViewList.prototype.getViewInstance = function(model, options)
	{
		var view = this.viewEntry;

		// create the view and remember. note: auto render is on
		var instance = new view(lodash.extend({}, options || {},
		{
			autoRender: true,
			model: model,
			list: this
		}));

		if ((instance instanceof ViewListEntry) === false)
		{
			throw new Error('The view instance from an entry of a list must be instance of ViewListEntry.');
		}

		this.trigger('renderEntry', this, instance, model);

		return instance;
	};

	/**
	 * @returns {ViewList}
	 */
	ViewList.prototype.hideLoadingScreen = function()
	{
		if (this.showLoadingElement)
		{
			this.showLoadingElement.remove();
			delete this.showLoadingElement;
		}

		var element = this.getElementContainerLoading();
		if (element !== undefined)
		{
			element.removeClass('fetching');
		}

		return this;
	};

	/**
	 * @param {jQuery.Event} event
	 * @returns {ViewList}
	 */
	ViewList.prototype.onClickAll = function(event)
	{
		event.stop();

		this.collection.limit = null;

		return this;
	};

	/**
	 * @param {jQuery.Event} event
	 * @returns {ViewList}
	 */
	ViewList.prototype.onClickReload = function(event)
	{
		event.stop();

		this.collection.fetch(
		{
			reset: true
		});

		return this;
	};

	/**
	 * a entry was added to the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewList}
	 */
	ViewList.prototype.onCollectionAdd = function(model, collection, options)
	{
		this.renderEntry(model, collection.indexOf(model));

		return this;
	};

	/**
	 * a entry was removed from the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewList}
	 */
	ViewList.prototype.onCollectionRemove = function(model, collection, options)
	{
		this.removeEntry(model);

		return this;
	};

	/**
	 * the collection was completly reseted
	 *
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewList}
	 */
	ViewList.prototype.onCollectionReset = function(collection, options)
	{
		// remove all views
		lodash.each(this.viewEntries, function(view)
		{
			view.remove();
		});
		this.viewEntries = {};

		// render each entry
		this.renderEntries();

		return this;
	};

	/**
	 * the collection was sorted
	 *
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewList}
	 */
	ViewList.prototype.onCollectionSort = function(collection, options)
	{
		this.collection.each(function(model, index)
		{
			var id = model.cid + '-sort';
			if (this.renderQueue.exists(id) === false)
			{
				this.renderQueue.add(id, (function(model, index)
				{
					this.appendEntryToIndex(model, index);
				}).bind(this, model, index));
			}
		}, this);

		return this;
	};

	/**
	 * remove
	 *
	 * @returns {ViewList}
	 */
	ViewList.prototype.remove = function()
	{
		// remove the collections events
		this.collection.off(null, null, this);

		// remove all views
		lodash.each(this.viewEntries, function(view)
		{
			view.remove();
		});
		this.viewEntries = {};

		// remove sub views
		this.removeFilter();
		this.removeSorter();

		View.prototype.remove.apply(this, arguments);

		return this;
	};

	/**
	 * remove a entry
	 *
	 * @param {Model} model
	 * @returns {ViewList}
	 */
	ViewList.prototype.removeEntry = function(model)
	{
		var id = model.cid;

		if (this.viewEntries[id] !== undefined)
		{
			this.viewEntries[id].remove();
			delete this.viewEntries[id];
		}

		return this;
	};

	/**
	 * remove a filter view
	 *
	 * @returns {ViewList}
	 */
	ViewList.prototype.removeFilter = function()
	{
		if (this.viewFilter !== null && this.viewFilter !== undefined)
		{
			this.viewFilter.remove();
			this.viewFilter = null;
		}

		return this;
	};

	/**
	 * remove a sorter view
	 *
	 * @returns {ViewList}
	 */
	ViewList.prototype.removeSorter = function()
	{
		if (this.viewSorter !== null && this.viewSorter !== undefined)
		{
			this.viewSorter.remove();
			this.viewSorter = null;
		}

		return this;
	};

	/**
	 * render
	 *
	 * @returns {ViewLists}
	 */
	ViewList.prototype.render = function()
	{
		View.prototype.render.apply(this, arguments);

		// bind button events
		var events = {};
		events['click ' + this.selectorButtonAllEvent] = 'onClickAll';
		events['tap ' + this.selectorButtonAllEvent] = 'onClickAll';
		events['click ' + this.selectorButtonReloadEvent] = 'onClickReload';
		events['tap ' + this.selectorButtonReloadEvent] = 'onClickReload';
		this.appendDelegateEvents(events);

		// show loading
		if (this.showLoadingElement !== undefined)
		{
			this.hideLoadingScreen().showLoadingScreen();
		}

		// render each entry
		this.renderEntries();

		// render the filter
		this.renderFilter();

		// render the sorter
		this.renderSorter();

		return this;
	};

	/**
	 * render all entries
	 *
	 * @returns {ViewList}
	 */
	ViewList.prototype.renderEntries = function()
	{
		// render each entry
		this.collection.each(this.renderEntry, this);
	};

	/**
	 * renders an entry
	 *
	 * @param {Model} model
	 * @param {Number} index
	 * @returns {ViewList}
	 */
	ViewList.prototype.renderEntry = function(model, index)
	{
		var id = model.cid;

		// nothing to do
		if (this.viewEntries[id] !== undefined || this.renderQueue.exists(id) === true)
		{
			return this;
		}

		this.renderQueue.add(id, (function(model, index)
		{
			// create the view and remember. note: auto render is on
			this.viewEntries[id] = this.getViewInstance(model);

			// append to index
			this.appendEntryToIndex(model, index);
		}).bind(this, model, index))

		return this;
	};

	/**
	 * renders a filter view for list with given options
	 * if not options defined no filter will be rendered
	 *
	 * @returns {ViewList}
	 */
	ViewList.prototype.renderFilter = function()
	{
		if (this.filterOptions === null || this.filterOptions === undefined)
		{
			return this;
		}

		if (this.filterOptions.container === undefined && this.filterOptions.el === undefined && this.filterOptions.layoutContainer === undefined)
		{
			throw new Error('For a filter for a list must be defined the filterOptions "container", "el" or "layoutContainer".');
		}

		if (ViewListFilter === undefined)
		{
			ViewListFilter = require('forge/backbone/view/list/filter');
		}

		// options
		var options = lodash.extend(
		{
			autoRender: true,
			view: this
		}, this.filterOptions || {});

		// set container
		if (typeof options.container === 'string')
		{
			options.container = this.$el.find(options.container);
		}
		// set element
		if (typeof options.el === 'string')
		{
			options.el = this.$el.find(options.el);
		}

		//select by layout
		if (typeof options.layoutContainer === 'string' && this.layout !== undefined)
		{
			options.container = this.layout.$el.find(options.layoutContainer);
			delete options.layoutContainer;
		}

		// create the view
		this.viewFilter = this.createViewFilter(options);

		return this;
	};

	/**
	 * renders a sorter view for list with given options
	 * if not options defined no sorter will be rendered
	 *
	 * @returns {ViewList}
	 */
	ViewList.prototype.renderSorter = function()
	{
		if (this.sorterOptions === null || this.sorterOptions === undefined)
		{
			return this;
		}

		if (this.sorterOptions.container === undefined && this.sorterOptions.el === undefined && this.sorterOptions.layoutContainer === undefined)
		{
			throw new Error('For a sorter for a list must be defined the sorterOptions "container", "el" or "layoutContainer".');
		}

		// options
		var options = lodash.extend(
		{
			autoRender: true,
			view: this
		}, this.sorterOptions || {});

		// set container
		if (typeof options.container === 'string')
		{
			options.container = this.$el.find(options.container);
		}
		// set element
		if (typeof options.el === 'string')
		{
			options.el = this.$el.find(options.el);
		}

		//select by layout
		if (typeof options.layoutContainer === 'string' && this.layout !== undefined)
		{
			options.container = this.layout.$el.find(options.layoutContainer);
			delete options.layoutContainer;
		}

		// create the view
		this.viewSorter = this.createViewSorter(options);

		return this;
	};

	/**
	 * @returns {ViewList}
	 */
	ViewList.prototype.showLoadingScreen = function()
	{
		this.hideLoadingScreen();

		this.showLoadingElement = jQuery(this.templateLoading);

		var element = this.getElementContainerLoading();
		if (element !== undefined)
		{
			element.addClass('fetching').append(this.showLoadingElement);
		}

		return this;
	};

	return compatibility(ViewList);
});

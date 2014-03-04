'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/model',
	'forge/backbone/view',
	'forge/backbone/view/list/entry'
], function(
	lodash,
	jQuery,
	compatibility,
	Collection,
	Model,
	View,
	ViewListEntry
)
{
	/**
	 * list of view
	 *
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

		// validate
		if (this.collection === null || this.collection === undefined)
		{
			throw new Error('Collection can not be undefined for a view list');
		}

		if (this.viewEntry === null || this.viewEntry === undefined)
		{
			throw new Error('View for an entry can not be undefined for a view list');
		}

		this.viewEntries = {};

		View.apply(this, arguments);

		// in start mode, backbone made strange things with prototype :( and so we have the initial event binding and fetching here
		this.collection.on('add', this.onCollectionAdd, this);
		this.collection.on('remove', this.onCollectionRemove, this);
		this.collection.on('reset', this.onCollectionReset, this);
		this.collection.on('sort', this.onCollectionSort, this);
		this.collection.on('fetching', this.showLoadingScreen, this);
		this.collection.on('fetched', this.hideLoadingScreen, this);

		if (this.autoFetch === true && this.collection.length === 0)
		{
			// fetch the data
			this.collection.fetch();
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

				// in start mode, backbone made strange things with prototype :(
				if (this.cid !== undefined)
				{
					// add events
					collection.on('add', this.onCollectionAdd, this);
					collection.on('remove', this.onCollectionRemove, this);
					collection.on('reset', this.onCollectionReset, this);
					collection.on('sort', this.onCollectionSort, this);
					collection.on('fetching', this.showLoadingScreen, this);
					collection.on('fetched', this.hideLoadingScreen, this);

					// fetch the data
					if (this.autoFetch === true)
					{
						this.collection.fetch();
					}
				}

				this._collection = collection;
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
		}
	});

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

		console.debug('view for model (id: "' + (model ? model.id : model) + '") created.');

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

		this.getElementContainerLoading().removeClass('fetching');

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

		console.debug('model (id: "' + (model ? model.id : model) + '") was added in collection.');

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

		console.debug('model (id: "' + (model ? model.id : model) + '") was removed in collection.');

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
		this.collection.each(this.renderEntry, this);

		console.debug('collection was reseted.');

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
		console.debug('collection was sorted.');

		this.collection.each(this.appendEntryToIndex, this);

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

		View.prototype.remove.apply(this, arguments);

		console.debug('list removed.');

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
	 * render
	 *
	 * @returns {ViewLists}
	 */
	ViewList.prototype.render = function()
	{
		View.prototype.render.apply(this, arguments);

		if (this.showLoadingElement !== undefined)
		{
			this.hideLoadingScreen().showLoadingScreen();
		}
		// render each entry
		this.collection.each(this.renderEntry, this);

		console.debug('list rendered.');

		return this;
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
		if (this.viewEntries[id] !== undefined)
		{
			return this;
		}

		// create the view and remember. note: auto render is on
		this.viewEntries[id] = this.getViewInstance(model);

		// append to index
		this.appendEntryToIndex(model, index);

		return this;
	};

	/**
	 * @returns {ViewList}
	 */
	ViewList.prototype.showLoadingScreen = function()
	{
		this.hideLoadingScreen();

		this.showLoadingElement = jQuery(this.templateLoading);
		this.getElementContainerLoading().addClass('fetching').append(this.showLoadingElement);

		return this;
	};

	return compatibility(ViewList);
});
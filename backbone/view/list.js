'use strict';

define(
[
	'lodash',
	'forge/backbone/collection',
	'forge/backbone/model',
	'forge/backbone/view'
], function(
	lodash,
	Collection,
	Model,
	View
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

		if (this.autoFetch === true)
		{
			// fetch the data
			this.collection.fetch();
		}

		return this;
	};

	// compatibility
	ViewList.extend = View.extend;

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

					if (this.autoFetch === true)
					{
						// fetch the data
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
		var elementParent = this.selectorContainer === null || this.selectorContainer === undefined ? this.$el : this.$el.find(this.selectorContainer);
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
	 * @returns {View}
	 */
	ViewList.prototype.getViewInstance = function(model)
	{
		var view = this.viewEntry;

		// create the view and remember. note: auto render is on
		var instance = new view(
		{
			autoRender: true,
			model: model
		});

		console.debug('view for model (id: "' + (model ? model.id : model) + '") created.');

		return instance;
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
		console.debug('collection was reseted.');
		throw new Error('hmmmmmmmmmmmmmmmmmmmmm');
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

	return ViewList;
});
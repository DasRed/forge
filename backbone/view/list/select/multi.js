'use strict';

define(
[
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view/list',
	'forge/backbone/view/list/select/entry'
], function(
	compatibility,
	Collection,
	ViewList,
	ViewListSelectEntry
)
{
	/**
	 * list of view with multi selection
	 *
	 * @event {void} add({ViewListSelectMulti} view, {Collection}, selections, {Model} modelSelectionsAdded, {Collection} collection, {Model} modelCollection)
	 * @event {void} change({ViewListSelectMulti} view, {Collection}, selections, {Model} modelSelections, {Collection} collection, {Model} modelCollection)
	 * @event {void} remove({ViewListSelectMulti} view, {Collection}, selections, {Model} modelSelectionsRemoved, {Collection} collection, {Model} modelCollection)
	 * @param {Object} options
	 * @returns {ViewListSelectMulti}
	 */
	var ViewListSelectMulti = function(options)
	{
		options = options || {};

		// take collection from options
		if (options.selected !== undefined)
		{
			this.selected = options.selected;
			delete options.selected;
		}

		// validate
		if (this.selected === null || this.selected === undefined)
		{
			throw new Error('Selected Collection can not be undefined for a view list select multi');
		}

		ViewList.apply(this, arguments);

		// in start mode, backbone made strange things with prototype :( and so we have the initial event binding and fetching here
		this.selected.on('add', this.onSelectedAdd, this);
		this.selected.on('remove', this.onSelectedRemove, this);
		this.selected.on('reset', this.onSelectedReset, this);

		return this;
	};

	// prototype
	ViewListSelectMulti.prototype = Object.create(ViewList.prototype,
	{
		/**
		 * selectable by user or not
		 *
		 * @var {Boolean}
		 */
		selectable:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Collection}
		 */
		selected:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._selected;
			},
			set: function(collection)
			{
				if (collection === null || collection === undefined)
				{
					throw new Error('Collection can not be undefined for a view list');
				}

				// nothing to do
				if (this._selected === collection)
				{
					return;
				}

				// remove old events
				if (this._selected instanceof Collection)
				{
					this._selected.off(null, null, this);
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
					collection.on('add', this.onSelectedAdd, this);
					collection.on('remove', this.onSelectedRemove, this);
					collection.on('reset', this.onSelectedReset, this);
				}

				// set
				this._selected = collection;

				// call function for change
				if (this.cid === null || this.cid === undefined)
				{
					return;
				}

				this.onSelectedChange();
			}
		}
	});

	/**
	 * returns the view instance
	 *
	 * @param {Model} model
	 * @param {Object} options
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectMulti.prototype.getViewInstance = function(model, options)
	{
		var view = ViewList.prototype.getViewInstance.apply(this, arguments);

		if ((view instanceof ViewListSelectEntry) === false)
		{
			throw new Error('The view instance from an entry of a select list must be instance of ViewListSelectEntry.');
		}

		// listing on the select event
		view.on('select', function(viewEntry)
		{
			if (this.selectable === false)
			{
				return;
			}

			var modelSelected = this.selected.get(viewEntry.model.id);

			// add
			if (modelSelected === undefined)
			{
				this.selected.add(viewEntry.model.clone());
			}
			// remove
			else
			{
				this.selected.remove(modelSelected);
			}
		}, this);

		return view;
	};

	/**
	 * mark a view model as selected or not
	 *
	 * @param {Model} model
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.markViewModel = function(model)
	{
		if (model === undefined)
		{
			return this;
		}

		var view = this.getViewEntryByModel(model);
		if (this.selected.get(model.id) !== undefined)
		{
			view.markAsSelected();
		}
		else
		{
			view.markAsUnselected();
		}

		return this;
	};

	/**
	 * on selection added
	 *
	 * @param {Model} modelSelectionsAdded
	 * @param {Model} modelCollection
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onAdd = function(modelSelectionsAdded, modelCollection)
	{
		return this;
	};

	/**
	 * on selection change
	 *
	 * @param {Model} modelSelections
	 * @param {Model} modelCollection
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onChange = function(modelSelections, modelCollection)
	{
		return this;
	};

	/**
	 * a entry was added to the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onCollectionAdd = function(model, collection, options)
	{
		ViewList.prototype.onCollectionAdd.apply(this, arguments);

		this.markViewModel(model);

		return this;
	};

	/**
	 * the collection was completly reseted
	 *
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onCollectionReset = function(collection, options)
	{
		ViewList.prototype.onCollectionReset.apply(this, arguments);

		this.onSelectedChange();

		return this;
	};

	/**
	 * a entry was added to the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onSelectedAdd = function(model, collection, options)
	{
		var modelCollection = this.collection.get(model.id);

		this.markViewModel(modelCollection);

		this.trigger('add', this, this.selected, model, this.collection, modelCollection);
		this.onAdd(model, modelCollection);

		this.trigger('change', this, this.selected, model, this.collection, modelCollection);
		this.onChange(model, modelCollection);

		return this;
	};

	/**
	 * a entry was removed from the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onSelectedRemove = function(model, collection, options)
	{
		var modelCollection = this.collection.get(model.id);

		this.markViewModel(modelCollection);

		this.trigger('remove', this, this.selected, model, this.collection, modelCollection);
		this.onRemove(model, modelCollection);

		this.trigger('change', this, this.selected, model, this.collection, modelCollection);
		this.onChange(model, modelCollection);

		return this;
	};

	/**
	 * the collection was completly reseted
	 *
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewList}
	 */
	ViewListSelectMulti.prototype.onSelectedReset = function(collection, options)
	{
		this.onSelectedChange();

		return this;
	};

	/**
	 * selection changed
	 *
	 * @returns {Boolean}
	 */
	ViewListSelectMulti.prototype.onSelectedChange = function()
	{
		this.collection.each(function(model)
		{
			this.markViewModel(model);
		}, this);

		return true;
	};

	/**
	 * on selection remove
	 *
	 * @param {Model} modelSelectionsRemoved
	 * @param {Model} modelCollection
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.onRemove = function(modelSelectionsRemoved, modelCollection)
	{
		return this;
	};

	/**
	 * render
	 *
	 * @returns {ViewListSelectMulti}
	 */
	ViewListSelectMulti.prototype.render = function()
	{
		ViewList.prototype.render.apply(this, arguments);

		if (this.selectable === true)
		{
			this.getElementContainerEntry().addClass('selectable');
		}

		this.onSelectedChange();

		return this;
	};

	return compatibility(ViewListSelectMulti);
});
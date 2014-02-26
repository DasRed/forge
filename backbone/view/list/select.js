'use strict';

define(
[
	'forge/backbone/model',
	'forge/backbone/view/list',
	'forge/backbone/view/list/select/entry'
], function(
	Model,
	ViewList,
	ViewListSelectEntry
)
{
	/**
	 * list of view with selectin
	 *
	 * @event {void} change({ViewListSelect} view, {Model} modelSelectedOld, {View} viewModelSelectedOld, {Model} modelSelectedNew, {View} viewModelSelectedNew)
	 * @param {Object} options
	 * @returns {ViewListSelect}
	 */
	var ViewListSelect = function(options)
	{
		ViewList.apply(this, arguments);

		return this;
	};

	// compatibility
	ViewListSelect.extend = ViewList.extend;

	// prototype
	ViewListSelect.prototype = Object.create(ViewList.prototype,
	{
		/**
		 * auto select if no entry is selected
		 *
		 * @var {Boolean}
		 */
		autoSelect:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Model}
		 */
		selected:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._selected === undefined || this._selected === null)
				{
					return undefined;
				}

				return this._selected;
			},
			set: function(modelSelected)
			{
				// nothing to select
				if (this.collection.length === 0)
				{
					// set the value later after sync
					this.collection.off('sync', null, this);
					this.collection.once('sync', function()
					{
						this.selected = modelSelected;
					}, this);

					return;
				}

				// find model by index or id
				if (typeof modelSelected === 'number' || typeof modelSelected === 'string')
				{
					// first try to find the number by id
					modelSelected = this.collection.find(function(model, index)
					{
						return model.id === modelSelected;
					});

					// not found try to find with index
					if (modelSelected === undefined && this.collection.models.length <= modelSelected)
					{
						modelSelected = this.collection.models[modelSelected];
					}
				}
				// find by unique model id
				else if (typeof modelSelected === 'string')
				{
					// try to find the number by cid
					modelSelected = this.collection.find(function(model, index)
					{
						return model.cid === modelSelected;
					});
				}

				// autoselect the first if nothing is selected
				if (this.autoSelect === true && (modelSelected === null || modelSelected === undefined))
				{
					modelSelected = this.collection.first();
				}

				// no null
				if (modelSelected === null)
				{
					modelSelected = undefined;
				}

				// call function for change. if return false nothing to do
				if (this.onSelectedChange(this._selected, modelSelected) === false)
				{
					return;
				}

				// set selected
				this._selected = modelSelected;
			}
		}
	});

	/**
	 * returns the view instance
	 *
	 * @param {Model} model
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelect.prototype.getViewInstance = function(model)
	{
		var view = ViewList.prototype.getViewInstance.apply(this, arguments);

		if ((view instanceof ViewListSelectEntry) === false)
		{
			throw new Error('The view instance from an entry of a select list must be instance of ViewListSelectEntry.');
		}

		// listing on the select event
		view.on('select', function(viewEntry)
		{
			this.selected = viewEntry.model;
		}, this);

		return view;
	};

	/**
	 * on selection change
	 */
	ViewListSelect.prototype.onChange = function(modelSelectedOld, viewModelSelectedOld, modelSelectedNew, viewModelSelectedNew)
	{
		return this;
	};

	/**
	 * a entry was added to the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewListSelect}
	 */
	ViewListSelect.prototype.onCollectionAdd = function(model, collection, options)
	{
		ViewList.prototype.onCollectionAdd.apply(this, arguments);

		if (this.autoSelect === true && this.selected === undefined)
		{
			this.selected = model;
		}

		return this;
	};

	/**
	 * a entry was removed from the collection
	 *
	 * @param {Model} model
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewListSelect}
	 */
	ViewListSelect.prototype.onCollectionRemove = function(model, collection, options)
	{
		ViewList.prototype.onCollectionRemove.apply(this, arguments);

		if (this.selected === model)
		{
			this.selected = undefined;
		}

		return this;
	};

	/**
	 * the collection was completly reseted
	 *
	 * @param {Collection} collection
	 * @param {Object} object
	 * @returns {ViewList}
	 */
	ViewListSelect.prototype.onCollectionReset = function(collection, options)
	{
		ViewList.prototype.onCollectionReset.apply(this, arguments);
		
		// find the model which have the same id
		if (this.selected !== undefined)
		{
			this.selected = this.collection.find(function(model)
			{
				return model.id == this.id;
			}, this.selected);
		}

		return this;
	};
	
	/**
	 * selection changed
	 *
	 * @param {Model} modelSelectedOld
	 * @param {Model} modelSelectedNew
	 * @returns {Boolean}
	 */
	ViewListSelect.prototype.onSelectedChange = function(modelSelectedOld, modelSelectedNew)
	{
		var viewModelSelectedOld = this.getViewEntryByModel(modelSelectedOld, false);
		var viewModelSelectedNew = this.getViewEntryByModel(modelSelectedNew, false);

		this.trigger('change', this, modelSelectedOld, viewModelSelectedOld, modelSelectedNew, viewModelSelectedNew);
		this.onChange(modelSelectedOld, viewModelSelectedOld, modelSelectedNew, viewModelSelectedNew);

		if (viewModelSelectedOld instanceof ViewListSelectEntry)
		{
			viewModelSelectedOld.markAsUnselected();
		}

		if (viewModelSelectedNew instanceof ViewListSelectEntry)
		{
			viewModelSelectedNew.markAsSelected();
		}

		console.debug('new view selected "' + (viewModelSelectedNew ? viewModelSelectedNew.cid : viewModelSelectedNew) + '" with model (id: "' + (modelSelectedNew ? modelSelectedNew.id : modelSelectedNew) + '").');

		return true;
	};

	/**
	 * render
	 *
	 * @returns {ViewListSelect}
	 */
	ViewListSelect.prototype.render = function()
	{
		ViewList.prototype.render.apply(this, arguments);

		if (this.autoSelect === true && this.selected === undefined && this.collection.length > 0)
		{
			this.selected = this.collection.models[0];
		}

		return this;
	};


	return ViewListSelect;
});
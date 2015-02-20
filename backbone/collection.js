'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/url/parameter',
	'forge/backbone/compatibility',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	UrlParameter,
	compatibility,
	Model
)
{
	var collator = undefined;
	var setOptions =
	{
		add: true,
		remove: true,
		merge: true
	};

	/**
	 * Collection for Models
	 *
	 * @event {void} fetching({Collection} collection)
	 * @event {void} fetched({Collection} collection)
	 * @event {void} sort:comparator:changed({Collection} collection, {String} comparatorNew, {String} comparatorOld)
	 * @event {void} sort:direction:changed({Collection} collection, {String} directionNew, {String} directionOld)
	 * @param {Array} models
	 * @param {Object} options
	 */
	function Collection(models, options)
	{
		// copy options
		if (options !== undefined && options !== null)
		{
			var key = undefined;
			for (key in options)
			{
				if (this[key] !== undefined)
				{
					this[key] = options[key];
				}
			}
		}

		// only collection with models
		if (this.model === undefined || this.model === null)
		{
			throw new Error('A collection must define a model.');
		}

		this.cid = lodash.uniqueId('collection');

		Backbone.Collection.apply(this, arguments);
	};

	Collection.DIRECTION_ASC = 'asc';
	Collection.DIRECTION_DESC = 'desc';

	// prototype
	Collection.prototype = Object.create(Backbone.Collection.prototype,
	{
		/**
		 * @var {String}
		 */
		cid:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		comparator:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._comparator === undefined)
				{
					return 'id';
				}
				return this._comparator;
			},
			set: function(comparator)
			{
				if (this._comparator !== comparator)
				{
					var comparatorOld = this._comparator;
					this._comparator = comparator;
					if (this.cid !== null && this.cid !== undefined)
					{
						this.trigger('sort:comparator:changed', this, comparator, comparatorOld);
						this.sort();
					}
				}
			}
		},

		/**
		 * current direction
		 *
		 * @var {String}
		 */
		direction:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				// set the direction if not setted
				if (this._direction === undefined)
				{
					var attributeType = this.model.getPrototypeValue('attributeTypes')[this.comparator];

					switch (true)
					{
						// sort by another collection can not work
						case attributeType === Model.ATTRIBUTE_TYPE_COLLECTION:
							throw new Error('Sorting for an attribute of type collection is not allowed.');

						// sort by another model can not work
						case attributeType === Model.ATTRIBUTE_TYPE_MODEL:
							throw new Error('Sorting for an attribute of type model is not allowed.');

						// sort by date always sort DESC
						case attributeType === Model.ATTRIBUTE_TYPE_DATE:
						case attributeType === Model.ATTRIBUTE_TYPE_DATETIME:
						case attributeType === Model.ATTRIBUTE_TYPE_TIME:
							this._direction = Collection.DIRECTION_DESC;
							break;

						// initial direction is
						default:
							this._direction = Collection.DIRECTION_ASC;
					}
				}

				return this._direction;
			},
			set: function(direction)
			{
				if (this._direction !== direction)
				{
					var directionOld = this._direction;
					this._direction = direction;
					if (this.cid !== null && this.cid !== undefined)
					{
						this.trigger('sort:direction:changed', this, direction, directionOld);
						this.sort();
					}
				}
			}
		},

		/**
		 * option fetch silent
		 *
		 * @var {Boolean}
		 */
		fetchSilentDefault:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * collection is currently fetching
		 *
		 * @var {Boolean}
		 */
		isFetching:
		{
			value: false,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * default model for data
		 *
		 * @var {Model}
		 */
		model:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * url
		 * @var {String}
		 */
		url:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				// no url defined...
				if (this._url === undefined)
				{
					return undefined;
				}

				// create the parser
				if (this._urlParameter === undefined)
				{
					this._urlParameter = new UrlParameter();
					this._urlParameter.url = this._url;
				}

				// parsing
				return this._urlParameter.parse(this);
			},
			set: function(url)
			{
				this._url = url;
			}
		},

		/**
		 * @var {Boolean}
		 */
		waitDefault:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * reset of collection with full model destroy
	 *
	 * @returns {Collection}
	 */
	Collection.prototype._reset = function()
	{
		if (this.models !== undefined && this.models !== null)
		{
			var i = 0;
			var length = this.models.length;
			for (i = 0; i < length; i++)
			{
				this.models[i].clearFromMemory();
			}
		}

		Backbone.Collection.prototype._reset.apply(this, arguments);

		return this;
	};

	/**
	 * create with default wait
	 *
	 * @param {Model} key
	 * @param {Object} options
	 * @returns {Collection}
	 */
	Collection.prototype.create = function(model, options)
	{
		options = options || {};
		options.wait = options.wait !== undefined ? options.wait : this.waitDefault;

		// fixing model url if wait is true... if the model has no url root
		// and wait ist true, the model will be added AFTER save on server
		// but this cause in an error in Backbone, because the model save method will be called
		// without an collection on the model (remember: add after save)
		if (options.wait === true && model.urlRoot === undefined)
		{
			model.urlRoot = this.url;
			if (this.url instanceof Function)
			{
				model.urlRoot = this.url.bind(this);
			}
		}

		Backbone.Collection.prototype.create.call(this, model, options);

		return this;
	};

	/**
	 * @param {Object} options
	 * @returns {Collection}
	 */
	Collection.prototype.fetch = function(options)
	{
		if (this.isFetching === true)
		{
			console.warn('Collection is currenty in fetching. Abort new fetch.');
			return this;
		}
		this.isFetching = true;

		options = options || {};
		if (options.silent === undefined)
		{
			options.silent = this.fetchSilentDefault;
		}

		var self = this;
		var completeCallback = options.complete;
		options.complete = function(jqXHR, textStatus)
		{
			var result = undefined;
			if (completeCallback instanceof Function)
			{
				result = completeCallback.call(self, jqXHR, textStatus);
			}

			self.trigger('fetched', self);
			self.isFetching = false;

			return result;
		};

		this.trigger('fetching', this);

		Backbone.Collection.prototype.fetch.call(this, options);

		return this;
	};

	/**
	 * save method for the whole colleciton
	 *
	 * @param {Object} options
	 * @returns {Collection}
	 */
	Collection.prototype.save = function(options)
	{
		options = options || {};

		if (options.parse === undefined)
		{
			options.parse = true;
		}

		var self = this;
		var successCallback = options.success;
		var completeCallback = options.complete;

		options.success = function(resp)
		{
			var method = options.reset ? 'reset' : 'set';
			self[method](resp, options);
			if (successCallback instanceof Function)
			{
				successCallback(self, resp, options);
			}
			self.trigger('sync', self, resp, options);
		};

		options.complete = function(jqXHR, textStatus)
		{
			var result = undefined;
			if (completeCallback instanceof Function)
			{
				result = completeCallback.call(self, jqXHR, textStatus);
			}

			self.trigger('saved', self);

			return result;
		};

		this.sync('update', this, options);

		return this;
	};

	/**
	 * improved Backbone.Collection.set function... taken from Backbone.Collection and improved some code parts
	 *
	 * @param {Array} models
	 * @param {Object} options
	 * @returns {Array}
	 */
	Collection.prototype.set = function(models, options)
	{
		// nothing to do
		if (models === null || models === undefined)
		{
			return models;
		}

		// just only array
		if ((models instanceof Array) === false)
		{
			if (models instanceof Object)
			{
				models = [models];
			}
			else
			{
				throw new Error('Models must be an instance of array');
			}
		}

		options = lodash.defaults({}, options, setOptions);
		if (options.parse)
		{
			models = this.parse(models, options);
		}

		var i = undefined;
		var l = undefined;
		var id = undefined;
		var model = undefined;
		var attrs = undefined;
		var existing = undefined;
		var sort = undefined;
		var at = options.at;
		var targetModel = this.model;
		var sortable = this.comparator && (at == null) && options.sort !== false;
		var sortAttr = _.isString(this.comparator) ? this.comparator : null;
		var toAdd = [];
		var toRemove = [];
		var modelMap = {};
		var add = options.add;
		var merge = options.merge;
		var remove = options.remove;
		var order = !sortable && add && remove ? [] : false;
		var modelIsNew = false;
		var collectionLength = this.length;

		// Turn bare objects into model references, and prevent invalid models
		// from being added.
		for (i = 0, l = models.length; i < l; i++)
		{
			attrs = models[i] || {};
			if (attrs instanceof Backbone.Model)
			{
				id = model = attrs;
			}
			else
			{
				id = attrs[targetModel.prototype.idAttribute || 'id'];
			}

			// If a duplicate is found, prevent it from being added and
			// optionally merge it into the existing model.
			if (collectionLength !== 0 && (existing = this.get(id)))
			{
				if (remove)
				{
					modelMap[existing.cid] = true;
				}
				if (merge)
				{
					attrs = attrs === model ? model.attributes : attrs;
					if (options.parse)
					{
						attrs = existing.parse(attrs, options);
					}
					existing.set(attrs, options);
					if (sortable && !sort && existing.hasChanged(sortAttr))
					{
						sort = true;
					}
				}
				models[i] = existing;
				modelIsNew = false;
				model = existing || model;
			}
			// If this is a new, valid model, push it to the `toAdd` list.
			else if (add)
			{
				model = models[i] = this._prepareModel(attrs, options);
				if (!model)
				{
					continue;
				}
				modelIsNew = true;
				toAdd.push(model);
				this._addReference(model, options);
			}

			// Do not add multiple models with the same `id`.
			if (order && (modelIsNew || !modelMap[model.id]))
			{
				order.push(model);
			}
			modelMap[model.id] = true;
		}

		// Remove nonexistent models if appropriate.
		if (remove)
		{
			for (i = 0, l = collectionLength; i < l; ++i)
			{
				if (!modelMap[(model = this.models[i]).cid])
				{
					toRemove.push(model);
				}
			}
			if (toRemove.length)
			{
				this.remove(toRemove, options);
			}
		}

		// See if sorting is needed, update `length` and splice in new models.
		if (toAdd.length || (order && order.length))
		{
			if (sortable)
			{
				sort = true;
			}
			this.length += toAdd.length;
			if (at != null)
			{
				for (i = 0, l = toAdd.length; i < l; i++)
				{
					this.models.splice(at + i, 0, toAdd[i]);
				}
			}
			else
			{
				if (order)
				{
					this.models.length = 0;
				}
				var orderedModels = order || toAdd;
				for (i = 0, l = orderedModels.length; i < l; i++)
				{
					this.models.push(orderedModels[i]);
				}
			}
		}

		// Silently sort the collection if appropriate.
		if (sort)
		{
			this.sort(
			{
				silent: true
			});
		}

		// Unless silenced, it's time to fire all appropriate add/sort events.
		if (!options.silent)
		{
			for (i = 0, l = toAdd.length; i < l; i++)
			{
				(model = toAdd[i]).trigger('add', model, this, options);
			}
			if (sort || (order && order.length))
			{
				this.trigger('sort', this, options);
			}
		}

		// Return the added (or merged) model (or models).
		return models;
	};

	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 *
	 * overwritten to implement natural sort
	 * @param {Object} options
	 * @returns {Collection}
	 */
	Collection.prototype.sort = function(options)
	{
		var propertyName = this.comparator;
		if (this.models === undefined || this.models === null || this.models.length === 0 || propertyName === undefined || propertyName === null)
		{
			return this;
		}

		if (collator === undefined)
		{
			collator = new Intl.Collator();
		}

		var direction = this.direction;

		this.models.sort(function(modelA, modelB)
		{
			var valueA = modelA.attributes[propertyName];
			var valueB = modelB.attributes[propertyName];

			var result = 0;

			// use natural sort for strings
			if (modelA.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_STRING || modelB.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_STRING)
			{
				result = collator.compare(valueA, valueB);
			}
			// compare time
			else if (modelA.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_TIME && modelB.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_TIME)
			{
				var valueATime = valueA.getHours() * 60 * 60 * 1000;
				valueATime += valueA.getMinutes() *  60 * 1000;
				valueATime += valueA.getSeconds() *  1000;
				valueATime += valueA.getMilliseconds();

				var valueBTime = valueB.getHours() * 60 * 60 * 1000;
				valueBTime += valueB.getMinutes() *  60 * 1000;
				valueBTime += valueB.getSeconds() *  1000;
				valueBTime += valueB.getMilliseconds();

				// use direct value compare
				if (valueATime < valueBTime)
				{
					result = -1;
				}
				else if (valueATime > valueBTime)
				{
					result = 1;
				}
			}
			// use direct value compare
			else if (valueA < valueB)
			{
				result = -1;
			}
			else if (valueA > valueB)
			{
				result = 1;
			}

			// reverse sort?
			if (direction == Collection.DIRECTION_DESC)
			{
				result *= -1;
			}

			return result;
		});

		options = options || {};
		if (options.silent === undefined || options.silent === false)
		{
			this.trigger('sort', this, options);
		}

		return this;
	};

	/**
	 * @param {Object}|{Array} properties can be NULL || UNDEFINED to use all fields. If it is an object then the value is the column name and the key the property field
	 * @param {String} delimiter default ';'
	 * @param {String} enclosure default '"'
	 * @returns {String}
	 */
	Collection.prototype.toCSV = function(properties, delimiter, enclosure)
	{
		var rows = [];

		delimiter = delimiter || ';';
		enclosure = enclosure || '"';

		var enclosureRegExp = new RegExp(enclosure, 'gi');
		var enclosureReplace = enclosure + enclosure;

		if (lodash.isPlainObject(properties) === true)
		{
			rows.push(lodash.reduce(properties, function(acc, columnName, propertyName)
			{
				// quote
				columnName = String(columnName);
				var columnNameQuoted = columnName.replace(enclosureRegExp, enclosureReplace);
				if (columnNameQuoted !== columnName)
				{
					columnNameQuoted = enclosure + columnNameQuoted + enclosure;
				}

				acc.push(columnNameQuoted);

				return acc;
			}, []).join(delimiter));

			properties = Object.keys(properties);
		}

		return this.reduce(function(acc, model)
		{
			acc.push(model.toCSV(properties, delimiter, enclosure));

			return acc;
		}, rows).join('\n');
	};

	return compatibility(Collection);
});
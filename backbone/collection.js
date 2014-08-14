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

	/**
	 * Collection for Models
	 *
	 * @event {void} fetching({Collection} collection)
	 * @event {void} fetched({Collection} collection)
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
					this._comparator = comparator;
					if (this.cid !== null && this.cid !== undefined)
					{
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

					// initial direction is
					this._direction = Collection.DIRECTION_ASC;

					// sort by another collection can not work
					if (attributeType === Model.ATTRIBUTE_TYPE_COLLECTION)
					{
						throw new Error('Sorting for an attribute of type collection is not allowed.');
					}

					// sort by another model can not work
					else if (attributeType === Model.ATTRIBUTE_TYPE_MODEL)
					{
						throw new Error('Sorting for an attribute of type model is not allowed.');
					}

					// sort by date always sort DESC
					else if (attributeType === Model.ATTRIBUTE_TYPE_DATE)
					{
						this._direction = Collection.DIRECTION_DESC;
					}
				}

				return this._direction;
			},
			set: function(direction)
			{
				if (this._direction !== direction)
				{
					this._direction = direction;
					if (this.cid !== null && this.cid !== undefined)
					{
						this.sort();
					}
				}
			}
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
		options = options || {};

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

			return result;
		};

		this.trigger('fetching', this);

		Backbone.Collection.prototype.fetch.call(this, options);

		return this;
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
		if (options.silent === false)
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

			properties = lodash.keys(properties);
		}

		return this.reduce(function(acc, model)
		{
			acc.push(model.toCSV(properties, delimiter, enclosure));

			return acc;
		}, rows).join('\n');
	};

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

	return compatibility(Collection);
});
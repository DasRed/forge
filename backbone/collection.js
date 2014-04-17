'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/collator',
	'forge/url/parameter',
	'forge/backbone/compatibility',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	collator,
	UrlParameter,
	compatibility,
	Model
)
{
	var excludeProperties =
	{
		model: true,
		comparator: true
	};

	/**
	 * Collection for Models
	 *
	 * @event {void} fetching({Collection} collection)
	 * @event {void} fetched({Collection} collection)
	 * @param {Array} models
	 * @param {Object} options
	 * @returns {Collection}
	 */
	var Collection = function(models, options)
	{
		// copy options
		lodash.each(options, function(value, key)
		{
			if (excludeProperties[key] === true)
			{
				return;
			}
			if (this[key] !== undefined)
			{
				this[key] = value;
			}
		}, this);

		Backbone.Collection.apply(this, arguments);

		return this;
	};

	// prototype
	Collection.prototype = Object.create(Backbone.Collection.prototype,
	{
		/**
		 * default model for data
		 *
		 * @var {Model}
		 */
		model:
		{
			value: Model,
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
					return undefined
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
		var self = this;
		options = options || {};

		var completeCallback = options.complete;
		options.complete = (function()
		{
			var result = undefined;
			if (completeCallback instanceof Function)
			{
				result = completeCallback.apply(this, arguments);
			}

			this.trigger('fetched', this);

			return result;
		}).bind(this);

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
		if (!this.comparator)
		{
			throw new Error('Cannot sort a set without a comparator');
		}

		options = options || {};

		// Run sort based on type of `comparator`.
		if (this.comparator instanceof Function)
		{
			// sort with one parameter
			if (this.comparator.length === 1)
			{
				this.models = lodash.sortBy(this.models, this.comparator, this);
			}
			// sort with 2 parameters callback function
			else
			{
				this.models.sort((this.comparator).bind(this));
			}
		}
		// sort by string (propertyName)
		else
		{
			this.models.sort((function(modelA, modelB)
			{
				return collator.compareModels(this.comparator, modelA, modelB);
			}).bind(this));
		}

		if (!options.silent)
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

	return compatibility(Collection);
});
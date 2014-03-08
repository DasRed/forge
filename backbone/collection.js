'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/collator',
	'forge/backbone/compatibility',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	collator,
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

	return compatibility(Collection);
});
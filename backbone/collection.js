'use strict';

define(
[
	'backbone',
	'forge/backbone/compatibility',
	'forge/backbone/model'
], function(
	Backbone,
	compatibility,
	Model
)
{
	/**
	 * Collection for Models
	 *
	 *
	 * @param {Array} models
	 * @param {Object} options
	 * @returns {Collection}
	 */
	var Collection = function(models, options)
	{
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

	return compatibility(Collection);
});
'use strict';

define(
[
	'backbone',
	'forge/backbone/model'
], function(
	Backbone,
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

	// compatibility
	Collection.extend = Backbone.Collection.extend;

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
		}
	});

	return Collection;
});
'use strict';

define(
[
	'backbone'
], function(
	Backbone
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
	Collection.prototype = Object.create(Backbone.Collection.prototype);

	return Collection;
});
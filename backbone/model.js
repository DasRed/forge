'use strict';

define(
[
	'backbone'
], function(
	Backbone
)
{
	/**
	 * Model
	 *
	 *
	 * @param {Object} attributes
	 * @param {Object} options
	 * @returns {Model}
	 */
	var Model = function(attributes, options)
	{
		Backbone.Model.apply(this, arguments);

		return this;
	};

	// compatibility
	Model.extend = Backbone.Model.extend;

	// prototype
	Model.prototype = Object.create(Backbone.Model.prototype);

	return Model;
});
'use strict';

define(
[
	'backbone',
	'forge/observer/object'
], function(
	Backbone,
	ObserverObject
)
{
	/**
	 * Model
	 *
	 * @param {Object} attributes
	 * @param {Object} options
	 * @returns {Model}
	 */
	var Model = function(attributes, options)
	{
		options = options || {};
		if (this.parseOnCreate === true && options.parse === undefined)
		{
			options.parse = true;
		}

		Backbone.Model.call(this, attributes, options);

		return this;
	};

	// compatibility
	Model.extend = Backbone.Model.extend;

	// prototype
	Model.prototype = Object.create(Backbone.Model.prototype,
	{
		/**
		 * defaults
		 *
		 * @var {Object}
		 */
		defaults:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		idAttribute:
		{
			value: 'id',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		idAttributeIsNumeric:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {ObserverObject}
		 */
		observer:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._observer === undefined)
				{
					this._observer = new ObserverObject(this.attributes)
				}

				return this._observer;
			}
		},

		/**
		 * automatic parsing on creation
		 *
		 * @var {Boolean}
		 */
		parseOnCreate:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * parsing of the attributes
	 *
	 * @param {Object} attributes
	 * @param {Object} options
	 * @returns {Object}
	 */
	Model.prototype.parse = function(attributes, options)
	{
		if (this.idAttributeIsNumeric === true)
		{
			attributes[this.idAttribute] = Number(attributes[this.idAttribute]);
		}

		return attributes;
	};

	return Model;
});
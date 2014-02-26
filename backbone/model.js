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
		attributes = Backbone.Model.prototype.parse.apply(this, arguments);

		if (this.idAttributeIsNumeric === true && attributes[this.idAttribute] !== undefined)
		{
			var number = attributes[this.idAttribute];

			if (isNaN(number) === false)
			{
				attributes[this.idAttribute] = number;
			}
		}

		return attributes;
	};

	/**
	 * set function
	 *
	 * @param {Object}|{String} key
	 * @param {Mixed} val
	 * @param {Object} options
	 * @returns {Model}
	 */
	Model.prototype.set = function(key, val, options)
	{
		var success = undefined;
		if (typeof key === 'object')
		{
			options = val;
		}
		success	= options.success;

		Backbone.Model.prototype.set.apply(this, arguments);
		if (success instanceof Function && options.xhr === undefined)
		{
			success.call(this, this, undefined, options);
		}

		return this;
	};

	return Model;
});
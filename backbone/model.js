'use strict';

define(
[
	'backbone',
	'forge/observer/object',
	'forge/backbone/compatibility'
], function(
	Backbone,
	ObserverObject,
	compatibility
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
	 * correct clonig
	 *
	 * @returns {Model}
	 */
	Model.prototype.clone = function()
	{
		var attributes = this.toJSON();
		var construct = this.constructor;

		return new construct(attributes);
	};

	/**
	 * destroy with default wait
	 *
	 * @param {Object} options
	 * @returns {Model}
	 */
	Model.prototype.destroy = function(options)
	{
		options = options || {};
		options.wait = options.wait !== undefined ? options.wait : this.waitDefault;

		Backbone.Model.prototype.destroy.call(this, options);

		return this;
	};

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
			var number = Number(attributes[this.idAttribute]);

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
		var complete = undefined;

		if (key == null || typeof key === 'object')
		{
			options = val;
		}

		if (options !== undefined)
		{
			success	= options.success;
			complete = options.complete;
		}

		Backbone.Model.prototype.set.apply(this, arguments);

		if (success instanceof Function && options.xhr === undefined)
		{
			success.call(this, this, undefined, options);
		}

		if (complete instanceof Function && options.xhr === undefined)
		{
			complete.call(this, this, undefined, options);
		}

		return this;
	};

	/**
	 * save with default wait
	 *
	 * @param {Object}|{String} key
	 * @param {Mixed} val
	 * @param {Object} options
	 * @returns {Model}
	 */
	Model.prototype.save = function(key, val, options)
	{
		if (key == null || typeof key === 'object')
		{
			val = val || {};
			val.wait = val.wait !== undefined ? val.wait : this.waitDefault;
		}
		else
		{
			options = options || {};
			options.wait = options.wait !== undefined ? options.wait : this.waitDefault;
		}

		Backbone.Model.prototype.save.call(this, key, val, options);

		return this;
	};

	return compatibility(Model);
});
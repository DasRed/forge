'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/observer/object',
	'forge/url/parameter',
	'forge/backbone/compatibility'
], function(
	lodash,
	Backbone,
	ObserverObject,
	UrlParameter,
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

	Model.ATTRIBUTE_TYPE_NUMBER = 'number';
	Model.ATTRIBUTE_TYPE_STRING = 'string';
	Model.ATTRIBUTE_TYPE_BOOLEAN = 'boolean';
	Model.ATTRIBUTE_TYPE_DATE = 'date';
	Model.ATTRIBUTE_TYPE_COLLECTION = 'collection';

	// prototype
	Model.prototype = Object.create(Backbone.Model.prototype,
	{

		/**
		 * mapping of attributes types
		 *
		 * @var {Object}
		 */
		attributeTypes:
		{
			value: {},
			enumerable: true,
			configurable: true,
			writable: true
		},
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
		 * url
		 *
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
					return Backbone.Model.prototype.url.apply(this);
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
		 * url root
		 *
		 * @var {String}
		 */
		urlRoot:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				// no url defined...
				if (this._urlRoot === undefined)
				{
					return undefined
				}

				// create the parser
				if (this._urlRootParameter === undefined)
				{
					this._urlRootParameter = new UrlParameter();
					this._urlRootParameter.url = this._urlRoot;
				}

				// parsing
				return this._urlRootParameter.parse(this);
			},
			set: function(url)
			{
				this._urlRoot = url;
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

		// type conversion
		attributes = lodash.reduce(this.attributeTypes, function(attributes, propertyType, propertyName)
		{
			// not found nothing to do
			if (attributes[propertyName] === null || attributes[propertyName] === undefined)
			{
				return attributes;
			}

			// get
			var value = attributes[propertyName];

			// convert
			switch (propertyType)
			{
				// write to a collection property direct on the model
				case Model.ATTRIBUTE_TYPE_COLLECTION:
					if (this[propertyName] === undefined || this[propertyName] === null || (this[propertyName].reset instanceof Function) === false)
					{
						throw new Error('The model property "' + propertyName + '" must be an instance of Collection to use the attribute type "collection" on the attribute "' + propertyName + '".');
					}
					this[propertyName].reset(value);
					delete attributes[propertyName];
					break;

				// convert to number
				case Model.ATTRIBUTE_TYPE_NUMBER:
					if (typeof value !== 'number')
					{
						var number = Number(value);
						if (isNaN(number) === false)
						{
							value = number;
						}
					}
					break;

				// convert to boolean
				case Model.ATTRIBUTE_TYPE_BOOLEAN:
					if (typeof value !== 'boolean')
					{
						switch (true)
						{
							case value === 'True':
							case value === 'TRUE':
							case value === 'true':
								value = true;
								break;

							case value === 'False':
							case value === 'FALSE':
							case value === 'false':
								value = false;
								break;

							case isNaN(Number(value)) === false:
								value = Boolean(Number(value));
								break;

							default:
								value = false;
								break;
						}
					}
					break;

				// convert to date
				case Model.ATTRIBUTE_TYPE_DATE:
					if ((value instanceof Date) === false)
					{
						value = new Date(value);
						if (value.isValid() === false)
						{
							throw new Error('Model attribute "' + propertyName + '" is not an date.');
						}
					}
					break;

				// strings
				case Model.ATTRIBUTE_TYPE_STRING:
					if (typeof value !== 'string')
					{
						value = String(value);
					}
					break;
			}

			// write back
			if (attributes[propertyName] !== undefined && attributes[propertyName] !== value)
			{
				attributes[propertyName] = value;
			}

			return attributes;
		}, attributes, this);

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

	/**
	 * to JSON
	 *
	 * @param {Object} options
	 * @returns {Object}
	 */
	Model.prototype.toJSON = function(options)
	{
		var attributes = Backbone.Model.prototype.toJSON.apply(this, arguments);

		// type conversion
		attributes = lodash.reduce(this.attributeTypes, function(attributes, propertyType, propertyName)
		{
			// convert back for JSON
			switch (propertyType)
			{
				// write to a collection property direct on the model
				case Model.ATTRIBUTE_TYPE_COLLECTION:
					if (this[propertyName] === undefined || this[propertyName] === null || (this[propertyName].toJSON instanceof Function) === false)
					{
						throw new Error('The model property "' + propertyName + '" must be an instance of Collection to use the attribute type "collection" on the attribute "' + propertyName + '".');
					}
					attributes[propertyName] = this[propertyName].toJSON(options);
					break;
			}

			return attributes;
		}, attributes, this);

		return attributes;
	};

	return compatibility(Model);
});

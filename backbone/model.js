'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/object/observer',
	'forge/url/parameter',
	'forge/backbone/compatibility'
], function(
	lodash,
	Backbone,
	ObjectObserver,
	UrlParameter,
	compatibility
)
{
	var excludeProperties =
	{
		collection: true,
		parse: true,
		unset: true,
		silent: true
	};

	/**
	 * Model
	 *
	 * @param {Object} attributes
	 * @param {Object} options
	 */
	function Model(attributes, options)
	{
		this.attributes = this.attributes || {};

		options = options || {};
		if (this.parseOnCreate === true && options.parse === undefined)
		{
			options.parse = true;
		}

		// copy options
		var key = undefined;
		for (key in options)
		{
			if (excludeProperties[key] === true)
			{
				continue;
			}
			if (this[key] !== undefined)
			{
				this[key] = options[key];
			}
		}

		// validation
		if ((this.attributeTypes instanceof Object) === false)
		{
			throw new Error('The property "attributeTypes" of a model must be defined!');
		}

		Backbone.Model.call(this, attributes, options);
	}

	Model.ATTRIBUTE_TYPE_NUMBER = 'number';
	Model.ATTRIBUTE_TYPE_STRING = 'string';
	Model.ATTRIBUTE_TYPE_BOOLEAN = 'boolean';
	Model.ATTRIBUTE_TYPE_DATE = 'date';
	Model.ATTRIBUTE_TYPE_COLLECTION = 'collection';
	Model.ATTRIBUTE_TYPE_MODEL = 'model';

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
			value: null,
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
		 * @var {ObjectObserver}
		 */
		observer:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				// object of model is not correct instanstiated... waits
				if (this.cid === undefined)
				{
					return undefined;
				}

				if (this._observer === undefined)
				{
					this._observer = new ObjectObserver(this.attributes,
					{
						autoObserve: false
					});
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
				return this._urlParameter.parse(this, this.attributes);
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
					return undefined;
				}

				// create the parser
				if (this._urlRootParameter === undefined)
				{
					this._urlRootParameter = new UrlParameter();
					this._urlRootParameter.url = this._urlRoot;
				}

				// parsing
				return this._urlRootParameter.parse(this, this.attributes);
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
	 * clears this model from memory and all dependencies
	 *
	 * @returns {Model}
	 */
	Model.prototype.clearFromMemory = function()
	{
		this.off();

		if (this._observer !== undefined)
		{
			this._observer.off();
			this._observer.unobserve();
		}

		delete this._observer;
		delete this._urlParameter;
		delete this._urlRootParameter;

		return this;
	};

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

		var attributeType = undefined;
		var value = undefined;
		var propertyName = undefined;
		var number = undefined;
		var valueConverted = undefined;

		// test properties in attributes if they are defined in attributeTypes
		for (propertyName in attributes)
		{
			attributeType = this.attributeTypes[propertyName];
			// exists propertyName?
			if (attributeType === undefined)
			{
				throw new Error('Can not parse model property "' + propertyName + '" in model. The property is not defined in "attributeTypes"!');
			}

			value = attributes[propertyName];

			// not found nothing to do
			if (value === null || value === undefined)
			{
				continue;
			}

			// convert
			// write to a collection property direct on the model
			if (attributeType === Model.ATTRIBUTE_TYPE_COLLECTION)
			{
				if (this[propertyName] === undefined || this[propertyName] === null || (this[propertyName].reset instanceof Function) === false)
				{
					throw new Error('The model property "' + propertyName + '" must be an instance of Collection to use the attribute type "collection" on the attribute "' + propertyName + '".');
				}
				this[propertyName].reset(value);
				delete attributes[propertyName];
			}

			// write to a model property direct on the model
			else if (attributeType === Model.ATTRIBUTE_TYPE_MODEL)
			{
				if (this[propertyName] === undefined || this[propertyName] === null || (this[propertyName].set instanceof Function) === false)
				{
					throw new Error('The model property "' + propertyName + '" must be an instance of Model to use the attribute type "model" on the attribute "' + propertyName + '".');
				}
				this[propertyName].set(value);
				delete attributes[propertyName];
			}

			// convert to number
			else if (attributeType === Model.ATTRIBUTE_TYPE_NUMBER)
			{
				if (typeof value !== 'number' || isNaN(value) === true)
				{
					number = Number(value);
					if (isNaN(number) === true)
					{
						throw new Error('The model property "' + propertyName + '" must be a number but the value "' + String(value) + '" can not be converted to a number.');
					}

					value = number;
				}
			}

			// convert to boolean
			else if (attributeType === Model.ATTRIBUTE_TYPE_BOOLEAN)
			{
				if (typeof value !== 'boolean')
				{
					if (value === 'True' || value === 'TRUE' || value === 'true')
					{
						value = true;
					}
					else if (value === 'False' || value === 'FALSE' || value === 'false')
					{
						value = false;
					}
					else
					{
						valueConverted = Number(value);
						if (isNaN(valueConverted) === false)
						{
							value = Boolean(valueConverted);
						}
						else
						{
							value = false;
						}
					}
				}
			}

			// convert to date
			else if (attributeType === Model.ATTRIBUTE_TYPE_DATE)
			{
				if ((value instanceof Date) === false)
				{
					valueConverted = new Date(value);
					if (isNaN(valueConverted.getTime()) === true)
					{
						throw new Error('Model attribute "' + propertyName + '" with "' + String(value) + '" is not an date.');
					}
					value = valueConverted;
				}
			}

			// strings
			else if (attributeType === Model.ATTRIBUTE_TYPE_STRING)
			{
				if (typeof value !== 'string')
				{
					value = String(value);
				}
			}

			// unknown type
			else
			{
				throw new Error('Model attributeType "' + attributeType + '" does not exists.');
			}

			// write back
			if (attributes[propertyName] !== undefined && attributes[propertyName] !== value)
			{
				attributes[propertyName] = value;
			}
		}

		return attributes;
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
	 * to CSV
	 *
	 * @param {Array} properties can be NULL || UNDEFINED to use all fields
	 * @param {String} delimiter default ';'
	 * @param {String} enclosure default '"'
	 * @returns {String}
	 */
	Model.prototype.toCSV = function(properties, delimiter, enclosure)
	{
		properties = properties || Object.keys(this.attributes);
		delimiter = delimiter || ';';
		enclosure = enclosure || '"';

		var enclosureRegExp = new RegExp(enclosure, 'gi');
		var enclosureReplace = enclosure + enclosure;

		return lodash.reduce(properties, function(acc, propertyName)
		{
			var value = this.attributes[propertyName];

			// convert
			switch (this.attributeTypes[propertyName])
			{
				case Model.ATTRIBUTE_TYPE_COLLECTION:
					console.warn('Model property ("' + propertyName + '") of type collection are not supported for CSV export.');
					value = '';
					break;

				case Model.ATTRIBUTE_TYPE_MODEL:
					console.warn('Model property ("' + propertyName + '") of type model are not supported for CSV export.');
					value = '';
					break;

				case Model.ATTRIBUTE_TYPE_NUMBER:
					if (lodash.isNumber(value) === true)
					{
						value = value.toLocaleString();
					}
					break;

				case Model.ATTRIBUTE_TYPE_BOOLEAN:
					value = value === true ? '1' : '0';
					break;

				case Model.ATTRIBUTE_TYPE_DATE:
					if (value instanceof Date)
					{
						value = value.toLocaleString();
					}
					break;

				case Model.ATTRIBUTE_TYPE_STRING:
				default:
					break;
			}

			// fix value
			if (value === undefined || value === null)
			{
				value = '';
			}

			// quote
			value = String(value);
			var valueQuoted = value.replace(enclosureRegExp, enclosureReplace);
			if (valueQuoted !== value)
			{
				valueQuoted = enclosure + valueQuoted + enclosure;
			}

			// add value
			acc.push(valueQuoted);

			return acc;
		}, [], this).join(delimiter);
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

				// write to a model property direct on the model
				case Model.ATTRIBUTE_TYPE_MODEL:
					if (this[propertyName] === undefined || this[propertyName] === null || (this[propertyName].toJSON instanceof Function) === false)
					{
						throw new Error('The model property "' + propertyName + '" must be an instance of Model to use the attribute type "model" on the attribute "' + propertyName + '".');
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

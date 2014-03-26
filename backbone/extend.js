'use strict';
define(
[
	'lodash',
	'backbone'
], function(
	lodash,
	Backbone
)
{
	/**
	 * looks for a property in prototype chain
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @returns {Object}
	 */
	var getPropertyDescriptor = function(obj, key)
	{
		var descriptor = Object.getOwnPropertyDescriptor(obj, key);

		if (descriptor === undefined)
		{
			if (obj.__proto__ == null)
			{
				return undefined;
			}
			return getPropertyDescriptor(obj.__proto__, key);
		}

		return descriptor;
	};

	/**
	 * extends the Backbone Extends function with predefined Values
	 *
	 * @param {Object} protoProps
	 * @param {Object} staticProps
	 * @returns {Object}
	 */
	return function(protoProps, staticProps)
	{
		var parent = this;
		var preDefinedValues = {};

		// add properties && functions to prototype
		preDefinedValues = lodash.reduce(protoProps, function(preDefinedValues, value, key)
		{
			var descriptor = getPropertyDescriptor(parent.prototype, key);

			// not defined... can be defined
			if (descriptor === undefined)
			{
				return preDefinedValues;
			}

			// defined as function not as property... can be defined
			if (descriptor.value instanceof Function)
			{
				return preDefinedValues;
			}

			// set a predefined property
			preDefinedValues[key] = {
				mode: (descriptor.set instanceof Function ? 'setter' : 'simple'),
				value: value
			};

			delete protoProps[key];

			return preDefinedValues;
		}, preDefinedValues, parent);

		/**
		 * create own constructor
		 */
		protoProps.constructor = function()
		{
			// copy options
			lodash.each(preDefinedValues, function(options, key)
			{
				if (options.mode === 'setter')
				{
					this[key] = options.value;
					return;
				}

				if (this[key] === undefined)
				{
					this[key] = options.value;
				}

				else if (lodash.isPlainObject(this[key]) === true && lodash.isPlainObject(options.value) === true)
				{
					lodash.merge(this[key], options.value);
				}

				else
				{
					this[key] = options.value;
				}
			}, this);

			return parent.apply(this, arguments);
		};

		return Backbone.View.extend.call(parent, protoProps, staticProps);
	};
});

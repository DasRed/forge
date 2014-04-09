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
			// define proto props constuctor informations
			var __protoPropsConstructorInformationsCreated = (this.__protoPropsConstructorInformations === undefined);
			if (__protoPropsConstructorInformationsCreated === true)
			{
				this.__protoPropsConstructorInformations =
				{
					level: 0,
					preDefinedValues: {}
				};
			}
			this.__protoPropsConstructorInformations.level++;

			// copy options
			lodash.each(preDefinedValues, function(options, key)
			{
				// property was setted before by a child instance option
				if (this.__protoPropsConstructorInformations.preDefinedValues[key] !== undefined)
				{
					return;
				}

				var valueIsPlainObject = lodash.isPlainObject(options.value);

				// using setter so make it short because calling a getter can make problems
				if (options.mode === 'setter')
				{
					this[key] = options.value;
					this.__protoPropsConstructorInformations.preDefinedValues[key] = true;
					return;
				}

				// property is undefined. set it
				if (this[key] === undefined)
				{
					this[key] = options.value;
					this.__protoPropsConstructorInformations.preDefinedValues[key] = true;
				}

				// property is an object an options value is also an object... merge both together
				else if (lodash.isPlainObject(this[key]) === true && valueIsPlainObject === true)
				{
					this[key] = lodash.merge({}, options.value, this[key]);
					// do not remember key in used keys, because objects will be merge from child to parent
				}

				// property is something ... create object by clone
				else if (valueIsPlainObject === true)
				{
					this[key] = lodash.merge({}, options.value);
					// do not remember key in used keys, because objects will be merge from child to parent
				}

				// simple set
				else
				{
					this[key] = options.value;
					this.__protoPropsConstructorInformations.preDefinedValues[key] = true;
				}
			}, this);

			// call partent constructor
			var result = parent.apply(this, arguments);

			// remove temp vars
			if (__protoPropsConstructorInformationsCreated === true)
			{
				delete this.__protoPropsConstructorInformations;
			}

			// done
			return result;
		};

		return Backbone.View.extend.call(parent, protoProps, staticProps);
	};
});

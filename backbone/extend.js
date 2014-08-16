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
	var cache = {};

	/**
	 * looks for a property in prototype chain
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @returns {Object}
	 */
	function getPropertyDescriptor(obj, key)
	{
		var descriptor = Object.getOwnPropertyDescriptor(obj, key);

		if (descriptor === undefined)
		{
			try
			{
				return getPropertyDescriptor(Object.getPrototypeOf(obj), key);
			}
			catch (exception)
			{
				return undefined;
			}
		}

		return descriptor;
	}

	/**
	 * extends the Backbone Extends function with predefined Values
	 *
	 * @param {Object} prototypeProperties
	 * @param {Object} staticProperties
	 * @returns {Object}
	 */
	function extend(prototypeProperties, staticProperties)
	{
		var parent = this;
		var preDefinedValues = {};
		var prototypePropertyName = undefined;
		var prototypePropertyValue = undefined;
		var descriptor = undefined;
		var doNormalPredefine = undefined;
		var parentPredefinedValueByKey = undefined;
		var cacheObj = undefined;

		if (parent[':uid'] === undefined)
		{
			Object.defineProperty(parent, ':uid',
			{
				value: lodash.uniqueId('obj'),
				enumerable: false,
				configurable: false,
				writable: false
			});
			cache[parent[':uid']] = {};
		}
		cacheObj = cache[parent[':uid']];

		// add properties && functions to prototype
		for (prototypePropertyName in prototypeProperties)
		{
			if (cacheObj[prototypePropertyName] !== undefined)
			{
				descriptor = cacheObj[prototypePropertyName];
			}
			else
			{
				descriptor = getPropertyDescriptor(parent.prototype, prototypePropertyName);
				if (descriptor !== undefined)
				{
					cacheObj[prototypePropertyName] = descriptor;
				}
			}
			// not defined... can be defined
			if (descriptor === undefined)
			{
				continue;
			}

			// defined as function not as property... can be defined
			if (descriptor.value instanceof Function)
			{
				continue;
			}

			prototypePropertyValue = prototypeProperties[prototypePropertyName];

			// set a predefined property
			doNormalPredefine = true;
			if ((descriptor.set instanceof Function) === false)
			{
				parentPredefinedValueByKey = this.getPrototypeValue(prototypePropertyName);
				if (parentPredefinedValueByKey !== undefined && lodash.isPlainObject(parentPredefinedValueByKey) === true && lodash.isPlainObject(prototypePropertyValue) === true)
				{
					doNormalPredefine = false;
					lodash.extend(parentPredefinedValueByKey, prototypePropertyValue);
					preDefinedValues[prototypePropertyName] =
					{
						mode: 'simple',
						value: parentPredefinedValueByKey
					};
				}
			}

			// overwrite
			if (doNormalPredefine === true)
			{
				preDefinedValues[prototypePropertyName] =
				{
					mode: (descriptor.set instanceof Function ? 'setter' : 'simple'),
					value: prototypePropertyValue
				};
			}

			delete prototypeProperties[prototypePropertyName];
		}

		/**
		 * create own constructor
		 */
		prototypeProperties.constructor = function()
		{
			// define proto props constuctor informations
			var __prototypePropertiesConstructorInformationsCreated = (this.__prototypePropertiesConstructorInformations === undefined);
			if (__prototypePropertiesConstructorInformationsCreated === true)
			{
				this.__prototypePropertiesConstructorInformations =
				{
					level: 0,
					preDefinedValues: {}
				};
			}
			this.__prototypePropertiesConstructorInformations.level++;

			// copy options
			var preDefinedValueName = undefined;
			var options = undefined;
			var valueIsPlainObject = undefined;
			for (preDefinedValueName in preDefinedValues)
			{
				options = preDefinedValues[preDefinedValueName];

				// property was setted before by a child instance option
				if (this.__prototypePropertiesConstructorInformations.preDefinedValues[preDefinedValueName] !== undefined)
				{
					continue;
				}

				valueIsPlainObject = lodash.isPlainObject(options.value);

				// using setter so make it short because calling a getter can make problems
				if (options.mode === 'setter')
				{
					this[preDefinedValueName] = options.value;
					this.__prototypePropertiesConstructorInformations.preDefinedValues[preDefinedValueName] = true;
					continue;
				}

				// property is undefined. set it
				if (this[preDefinedValueName] === undefined)
				{
					this[preDefinedValueName] = options.value;
					this.__prototypePropertiesConstructorInformations.preDefinedValues[preDefinedValueName] = true;
				}

				// property is an object an options value is also an object... merge both together
				else if (lodash.isPlainObject(this[preDefinedValueName]) === true && valueIsPlainObject === true)
				{
					this[preDefinedValueName] = lodash.merge({}, options.value, this[preDefinedValueName]);
					// do not remember preDefinedValueName in used preDefinedValueNames, because objects will be merge from child to parent
				}

				// property is something ... create object by clone
				else if (valueIsPlainObject === true)
				{
					this[preDefinedValueName] = lodash.merge({}, options.value);
					// do not remember preDefinedValueName in used preDefinedValueNames, because objects will be merge from child to parent
				}

				// simple set
				else
				{
					this[preDefinedValueName] = options.value;
					this.__prototypePropertiesConstructorInformations.preDefinedValues[preDefinedValueName] = true;
				}
			}

			// call partent constructor
			parent.apply(this, arguments);

			// remove temp vars
			if (__prototypePropertiesConstructorInformationsCreated === true)
			{
				delete this.__prototypePropertiesConstructorInformations;
			}
		};

		// store preDefined Values to find
		prototypeProperties.constructor.preDefinedValues = preDefinedValues;

		return Backbone.View.extend.call(parent, prototypeProperties, staticProperties);
	}

	return extend;
});
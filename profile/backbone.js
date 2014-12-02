'use strict';
define(
[
	'lodash'
], function(
	lodash
)
{
	var compatibility = undefined;
	var ENABLED = false;

	// not enabled do nothing
	if (ENABLED === false)
	{
		return {
			extendedObject: function()
			{
				return this;
			},

			nativeObject: function(ObjectConstructor)
			{
				return ObjectConstructor;
			}
		};
	}

	var ProfileBackbone =
	{
		/**
		 * this is for forge objects with "extended" functionality
		 *
		 * @param {Object} prototypeProperties
		 * @param {String} prototypePropertyName
		 * @returns {ProfileBackbone}
		 */
		extendedObject: function(prototypeProperties, prototypePropertyName)
		{
			wrapForProfile('EObject', prototypeProperties, prototypePropertyName);

			return this;
		},

		/**
		 * this is for forge objects with "compatibility" functionality
		 *
		 * @param {Function} ObjectConstructor
		 * @returns {Function} the new Object Constructor
		 */
		nativeObject: function(ObjectConstructor)
		{
			if (ObjectConstructor.___wrapped)
			{
				return ObjectConstructor;
			}

			var wrappedConstructor = function()
			{
				profile(this, ObjectConstructor, arguments, 'forge.' + ObjectConstructor.name + '.' + lodash.uniqueId('constructor.'));
			};

			wrappedConstructor.prototype = Object.create(ObjectConstructor.prototype);
			wrappedConstructor.___wrapped = true;

			// wrap function by new object
			for (var key in ObjectConstructor.prototype)
			{
				var descriptor = Object.getOwnPropertyDescriptor(ObjectConstructor.prototype, key);

				if (key !== 'constructor' && descriptor !== undefined && descriptor.value instanceof Function)
				{
					(function(functionName)
					{
						wrappedConstructor.prototype[functionName] = function()
						{
							return profile(this, ObjectConstructor.prototype[functionName], arguments, 'forge.' + ObjectConstructor.name + '.' + lodash.uniqueId(functionName + '.'));
						};
					})(key);
				}
			}

			// copy statics like CONST
			for (var key in ObjectConstructor)
			{
				if (key != 'extend' && key != 'getPrototypeValue')
				{
					wrappedConstructor[key] = ObjectConstructor[key];
				}
			}

			if (compatibility === undefined)
			{
				compatibility = require('forge/backbone/compatibility');
			}

			return compatibility(wrappedConstructor, false);
		}
	};

	// wrap a function for profiling
	function wrapForProfile(nameOfObject, prototypeObj, functionName)
	{
		if (prototypeObj['___' + functionName] !== undefined)
		{
			return;
		}
		prototypeObj['___' + functionName] = prototypeObj[functionName];
		prototypeObj[functionName] = function()
		{
			return profile(this, this['___' + functionName], arguments, 'forge.' + nameOfObject + '.' + lodash.uniqueId(functionName + '.'));
		};
	}

	function profile(obj, func, args, id)
	{
		// start profile
		window.Profiler.start(id);

		// run function
		var result = func.apply(obj, args);

		// pause, get stats and clear
		window.Profiler.pause(id);
		var current = window.Profiler.getStats(id);
		window.Profiler.clear(id);

		// calc to overall
		window.Profiler.create('forge');
		var forge = window.Profiler.getStats('forge');
		forge.totalTime += current.totalTime;
		forge.countStart += current.countStart;

		return result;
	}
	return ProfileBackbone;
});
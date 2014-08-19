'use strict';

define(
[
	'lodash',
	'forge/object/iterator'
], function(
	lodash,
	Iterator
)
{
	/**
	 * convert something to string
	 *
	 * @param {Mixed} value
	 * @returns {String}
	 * @throws Error
	 */
	function convertToString(value)
	{
		// convert date
		if (value instanceof Date)
		{
			value = value.toJson();
		}
		// convert function
		else if (value instanceof Function)
		{
			throw new Error('A function can not be converted to string.');
		}
		// convert array
		else if (value instanceof Array)
		{
			value = value.join('');
			var valueArray = value;
			var valueArrayLength = valueArray.length;
			var i = undefined;
			value = '';
			for (i = 0; i < valueArrayLength; i++)
			{
				value += i + '=' + convertToString(valueArray[i]);
			}
		}
		// convert object
		else if (value instanceof Object)
		{
			if (lodash.isPlainObject(value) === false)
			{
				throw new Error('A object instance can not be converted to string.');
			}

			var propertyName = undefined;
			var valueObj = value;
			value = '';
			for (propertyName in valueObj)
			{
				value += propertyName + '=' + convertToString(valueObj[propertyName]);
			}
		}
		// convert undefined or null
		else if (value === undefined || value === null)
		{
			value = '';
		}
		// something else
		else
		{
			value = String(value);
		}

		return value;
	}

	/**
	 * @param {Object} options
	 */
	function Cache(options)
	{
		this.cache = {};

		Iterator.call(this, options);
	};

	// prototype
	Cache.prototype = Object.create(Iterator.prototype,
	{
		/**
		 * @var {Object}
		 */
		cache:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * creates a unique hash
	 * @param {String} key
	 * @param {Mixed} attributes
	 * @returns {String}
	 */
	Cache.prototype.createHash = function(key, attributes)
	{
		return key + convertToString(attributes);
	};

	return Cache;
});

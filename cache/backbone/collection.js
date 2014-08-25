'use strict';

define(
[
	'forge/cache',
	'forge/backbone/collection'
], function(
	Cache,
	Collection
)
{
	/**
	 * @param {Object} options
	 */
	function CacheBackboneCollection(options)
	{
		Cache.call(this, options);
	}

	// prototype
	CacheBackboneCollection.prototype = Object.create(Cache.prototype);

	/**
	 * search the instance in cache or create and store the instance in cache
	 *
	 * @param {Collection} collection
	 * @param {Object} parameters
	 * @param {Array} models
	 * @returns {Collection}
	 */
	CacheBackboneCollection.prototype.getInstance = function(collection, parameters, models)
	{
		var hash = this.createHash(collection.getPrototypeValue('url'), parameters);

		var result = this.get(hash);
		if (result === null)
		{
			result = new collection(models, parameters);
			this.add(hash, result);
		}

		return result;
	};

	return CacheBackboneCollection;
});
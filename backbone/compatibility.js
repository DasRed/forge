'use strict';

define(
[
	'forge/backbone/extend'
], function(
	extend
)
{
	/**
	 * makes the object to backbone compatible
	 *
	 * @param {Object} ObjectConstructor
	 * @returns {Object}
	 */
	return function(ObjectConstructor)
	{
		ObjectConstructor.extend = extend;
		ObjectConstructor.prototype.constructor = ObjectConstructor;

		return ObjectConstructor;
	};
});
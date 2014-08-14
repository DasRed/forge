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
	function compatibility(ObjectConstructor)
	{
		ObjectConstructor.extend = extend;
		ObjectConstructor.prototype.constructor = ObjectConstructor;

		/**
		 * @param {String} propertyName
		 * @returns {Mixed}
		 */
		ObjectConstructor.getPrototypeValue = function(propertyName)
		{
			if (ObjectConstructor.prototype[propertyName] !== undefined && ObjectConstructor.prototype[propertyName] !== null)
			{
				return ObjectConstructor.prototype[propertyName];
			}

			if (this.preDefinedValues !== undefined && this.preDefinedValues[propertyName] !== undefined && this.preDefinedValues[propertyName] !== null)
			{
				return this.preDefinedValues[propertyName].value;
			}

			return undefined;
		};

		return ObjectConstructor;
	};

	return compatibility;
});
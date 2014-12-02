'use strict';

define(
[
	'forge/backbone/extend',
	'forge/profile/backbone'
], function(
	extend,
	ProfileBackbone
)
{
	/**
	 * makes the object to backbone compatible
	 *
	 * @param {Object} ObjectConstructor
	 * @param {Boolean} profileOfBackboneEnabled (default is true)
	 * @returns {Object}
	 */
	function compatibility(ObjectConstructor, profileOfBackboneEnabled)
	{
		ObjectConstructor.extend = extend;
		ObjectConstructor.prototype.constructor = ObjectConstructor;

		/**
		 * @param {String} propertyName
		 * @returns {Mixed}
		 */
		ObjectConstructor.getPrototypeValue = function(propertyName)
		{
			if (this.prototype[propertyName] !== undefined && this.prototype[propertyName] !== null)
			{
				return this.prototype[propertyName];
			}
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

		if (profileOfBackboneEnabled === undefined || profileOfBackboneEnabled === true)
		{
			return ProfileBackbone.nativeObject(ObjectConstructor);
		}

		return ObjectConstructor;
	};

	return compatibility;
});
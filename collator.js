'use strict';
define([], function()
{
	var collator = new Intl.Collator();

	/**
	 * compare model properties with direction
	 *
	 * @param {String} propertyName
	 * @param {Model} modelA
	 * @param {Model} modelB
	 * @param {String} direction defines the sort direction (default is asc. Values are "asc", "desc")
	 * @returns {Number}
	 */
	Intl.Collator.prototype.compareModels = function(propertyName, modelA, modelB, direction)
	{
		var valueA = modelA.attributes[propertyName];
		var valueB = modelB.attributes[propertyName];

		var result = 0;

		// use natural sort for strings
		if (typeof valueA === 'string' || typeof valueB === 'string')
		{
			result = this.compare(valueA, valueB);
		}
		// use direct value compare
		else if (valueA < valueB)
		{
			result = -1;
		}
		else if (valueA > valueB)
		{
			result = 1;
		}

		// reverse sort?
		if (direction == 'desc')
		{
			result *= -1;
		}

		return result;
	};

	return collator;
});
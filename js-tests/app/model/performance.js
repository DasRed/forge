'use strict';

define(
[
	'forge/backbone/model',
], function(
	Model
)
{
	var ModelPerformance = Model.extend(
	{
		/**
		 * @var {Object}
		 */
		attributeTypes:
		{
			id: Model.ATTRIBUTE_TYPE_NUMBER,
			string: Model.ATTRIBUTE_TYPE_STRING,
			number: Model.ATTRIBUTE_TYPE_NUMBER,
			date: Model.ATTRIBUTE_TYPE_DATE
		},

		/**
		 * @var {String}
		 */
		idAttribute: 'id'
	});

	return ModelPerformance;
});
'use strict';
define(
[
	'forge/backbone/model'
], function(
	Model
)
{
	var ViewTableCustomizerModelColumn = Model.extend(
	{
		/**
		 * @var {Object}
		 */
		attributeTypes:
		{
			id: Model.ATTRIBUTE_TYPE_NUMBER,
			user_id: Model.ATTRIBUTE_TYPE_NUMBER,
			table: Model.ATTRIBUTE_TYPE_STRING,
			column: Model.ATTRIBUTE_TYPE_STRING,
			positionOriginal: Model.ATTRIBUTE_TYPE_NUMBER,
			positionCurrent: Model.ATTRIBUTE_TYPE_NUMBER,
			positionRelative: Model.ATTRIBUTE_TYPE_NUMBER,
			visible: Model.ATTRIBUTE_TYPE_BOOLEAN,
			sorted: Model.ATTRIBUTE_TYPE_BOOLEAN,
			sortDirection: Model.ATTRIBUTE_TYPE_STRING
		},

		/**
		 * @var {String}
		 */
		idAttribute: 'column',

		/**
		 * @param {Object} attributes
		 * @param {Object} options
		 * @returns {Object}
		 */
		parse: function(attributes, options)
		{
			attributes = Model.prototype.parse.apply(this, arguments);

			if (attributes.visible === undefined)
			{
				attributes.visible = true;
			}

			if (attributes.sorted === undefined)
			{
				attributes.sorted = false;
			}

			return attributes;
		},

		/**
		 *
		 * @param {Object} options
		 * @returns {Object}
		 */
		toJSON: function(options)
		{
			var result = Model.prototype.toJSON.apply(this, arguments);

			if (typeof result.positionOriginal === 'number' && typeof result.positionCurrent === 'number')
			{
				result.positionRelative = result.positionCurrent - result.positionOriginal;
			}

			delete result.positionOriginal;
			delete result.positionCurrent;

			return result;
		}
	});

	ViewTableCustomizerModelColumn.DIRECTION_ASC = 'asc';
	ViewTableCustomizerModelColumn.DIRECTION_DESC = 'desc';

	return ViewTableCustomizerModelColumn;
});

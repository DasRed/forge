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
			name: Model.ATTRIBUTE_TYPE_STRING,
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
		idAttribute: 'name',

		/**
		 * the name for the table and can be used in the url root
		 *
		 * @var {String}
		 */
		tableName: null,

		/**
		 * defines a url Prefix to send to sever
		 * this is optional
		 *
		 * @var {String}
		 */
		urlPrefix: null,

		/**
		 * @var {String}
		 */
		urlRoot: '(:urlPrefix/)table-customize/:tableName',

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

	return ViewTableCustomizerModelColumn;
});

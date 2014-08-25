'use strict';
define(
[
	'forge/backbone/collection',
	'forge/backbone/view/table/customizer/model/column'
], function(
	Collection,
	ViewTableCustomizerModelColumn
)
{
	var ViewTableCustomizerCollectionColumns = Collection.extend(
	{
		/**
		 * @var {String}
		 */
		comparator: 'positionCurrent',

		/**
		 * @var {ViewTableCustomizerModelColumn}
		 */
		model: ViewTableCustomizerModelColumn,

		/**
		 * the name for the table and can be used in the url root
		 *
		 * @var {String}
		 */
		tableName: null,

		/**
		 * @var {String}
		 */
		url: '(:urlPrefix/)table-customize/:tableName',

		/**
		 * defines a url Prefix to send to sever
		 * this is optional
		 *
		 * @var {String}
		 */
		urlPrefix: null,

		/**
		 * finds the model, which triggers sort
		 *
		 * @returns {ViewTableCustomizerModelColumn}
		 */
		getModelForSorting: function()
		{
			var length = this.length;
			var model = undefined;
			var i = undefined;

			for (i = 0; i < length; i++)
			{
				model = this.models[i];
				if (model.attributes.sorted === true)
				{
					return model;
				}
			}
			return undefined;
		}
	});

	return ViewTableCustomizerCollectionColumns;
});

'use strict';

define(
[
	'forge/backbone/view/list'
], function(
	ViewList
)
{
	var ViewListInputSelect = ViewList.extend(
	{

		/**
		 * @var {String}
		 */
		selectorContainer: 'select',

		/**
		 * @returns {ViewListInputSelect}
		 */
		initialize: function()
		{
			ViewList.prototype.initialize.apply(this, arguments);

			this.collection.fetch();

			return this;
		},

		/**
		 * @returns {Object}
		 */
		getViewInstanceOptions: function()
		{
			return {
				testSelected: this.testSelected.bind(this)
			};
		},

		/**
		 * test for selected
		 *
		 * @param {Model} model
		 * @returns {Boolean}
		 */
		testSelected: function(model)
		{
			return false;
		}
	});

	return ViewListInputSelect;
});
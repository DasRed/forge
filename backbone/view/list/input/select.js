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
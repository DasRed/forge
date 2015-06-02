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
				testDisplay: this.testDisplay.bind(this),
				testSelected: this.testSelected.bind(this)
			};
		},

		/**
		 * @param {Number} id
		 * @returns {ViewListInputSelect}
		 */
		select: function(id)
		{
			var model = this.collection.find(function(model)
			{
				return model.id === id;
			});

			if (model === undefined)
			{
				return this;
			}

			this.getViewEntryByModel(model).select();

			return this;
		},

		/**
		 * test for display
		 *
		 * @param {Model} model
		 * @returns {Boolean}
		 */
		testDisplay: function(model)
		{
			return true;
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
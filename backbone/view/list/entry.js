'use strict';

define(
[
	'forge/backbone/compatibility',
	'forge/backbone/view'
], function(
	compatibility,
	View
)
{
	/**
	 * A View for one entry in list
	 *
	 * @param {Object} options
	 */
	function ViewListEntry(options)
	{
		View.apply(this, arguments);
	}

	// prototype
	ViewListEntry.prototype = Object.create(View.prototype,
	{
		/**
		 * the list of the entry
		 *
		 * @var {ViewList}
		 */
		list:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * tag name of list entry
		 *
		 * @var {String}
		 */
		tagName:
		{
			value: 'li',
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * render
	 *
	 * @returns {ViewListEntry}
	 */
	ViewListEntry.prototype.render = function()
	{
		View.prototype.render.apply(this, arguments);

		this.$el.attr('data-model-cid', this.model.cid);

		return this;
	};

	/**
	 * remap to unique view selector
	 *
	 * @returns {ViewListEntry}
	 */
	ViewListEntry.prototype.renderRemapViewSelector = function()
	{
		View.prototype.renderRemapViewSelector.call(this);

		var elementDataModels = this.$el.find(this.selectorDataModel + '[data-type]:not(td)');
		var elementDataModelsLength = elementDataModels.length;
		var elementDataModel = undefined;
		var elementDataModelDataType = undefined;
		var i = undefined;
		for (i = 0; i < elementDataModelsLength; i++)
		{
			elementDataModel = elementDataModels.eq(i);
			elementDataModelDataType = elementDataModel.attr('data-type');

			if (elementDataModelDataType !== undefined)
			{
				elementDataModel.closest('td').attr('data-type', elementDataModelDataType);
			}
		}

		return this;
	};

	return compatibility(ViewListEntry);
});
'use strict';

define(
[
	'forge/backbone/view/list/entry'
], function(
	ViewListEntry
)
{
	var ViewListInputSelectEntry = ViewListEntry.extend(
	{
		/**
		 * @var {String}
		 */
		tagName: 'option',

		/**
		 * @returns {ViewListInputSelectEntry}
		 */
		render: function()
		{
			ViewListEntry.prototype.render.apply(this, arguments);

			this.el.setAttribute('value', this.model.id);

			if (this.testDisplay(this.model) === false)
			{
				this.el.style.display = 'none';
			}

			if (this.testSelected(this.model) === true)
			{
				this.el.setAttribute('selected', 'selected');

				this.list.el.dispatchEvent(new Event('change',
					{
					'bubbles': true,
					'cancelable': true
					}));
			}

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

	return ViewListInputSelectEntry;
});

'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/backbone/collection',
	'forge/backbone/view',
	'text!forge/backbone/view/list/template/filter.html'
], function(
	lodash,
	jQuery,
	Collection,
	View,
	templateViewListFilter
)
{
	var ViewListFilter = View.extend(
	{
		/**
		 * collection for filter
		 *
		 * @var {Collection}
		 */
		collection: null,

		/**
		 * element with the list
		 *
		 * @var {jQuery}
		 */
		containerList: null,

		/**
		 * current filter value
		 *
		 * @var {String}
		 */
		current: '',

		/**
		 * @var {Object}
		 */
		events:
		{
			'click .clear, tap .clear': 'onClickClear',
			'keyup input': 'onKeyUpInput',
		},

		/**
		 * properties for sorting
		 *
		 * @var {Object}
		 */
		properties: null,

		/**
		 * @var {String}
		 */
		template: templateViewListFilter,

		/**
		 * filters
		 *
		 * @returns {ViewListFilter}
		 */
		filter: function()
		{
			this.containerList.find('[data-model-cid]').removeClass('filtered');
			if (this.current === '')
			{
				return this;
			}

			var regexp = new RegExp(this.current, 'i');
			this.collection.each(function(model)
			{
				var result = lodash.find(this.properties, function(propertyActive, propertyName)
				{
					if (propertyActive === false)
					{
						return false;
					}

					return regexp.test(String(this[propertyName]));
				}, model.attributes);

				// model does not match... hide view
				if (result === undefined)
				{
					this.containerList.find('[data-model-cid="' + model.cid + '"]').addClass('filtered');
				}
			}, this);

			return this;
		},

		/**
		 * init
		 *
		 * @returns {ViewListFilter}
		 */
		initialize: function()
		{
			this.filter = lodash.debounce(this.filter.bind(this), 100);

			View.prototype.initialize.apply(this, arguments);

			// validate
			if ((this.properties instanceof Object) === false || lodash.keys(this.properties).length === 0)
			{
				throw new Error('No properties are defined to filter or properties must be instance of Object.');
			}

			// validate
			if ((this.collection instanceof Collection) === false)
			{
				throw new Error('No collection is defined to filter or collection must be instance of Collection.');
			}

			// validate
			if ((this.containerList instanceof jQuery) === false && (this.containerList instanceof HTMLElement) === false && typeof this.containerList !== 'string')
			{
				throw new Error('No container list is defined to filter.');
			}
			this.containerList = jQuery(this.containerList);

			// collection is changing
			this.collection.on('add', this.filter, this);
			this.collection.on('reset', this.filter, this);

			return this;
		},

		/**
		 * clears the filter
		 *
		 * @returns {ViewListFilter}
		 */
		onClickClear: function(event)
		{
			event.stop();

			this.current = '';
			this.$el.find('input').val(this.current);

			this.filter();

			return this;
		},

		/**
		 * on click to change current property
		 *
		 * @returns {ViewListFilter}
		 */
		onKeyUpInput: function(event)
		{
			event.stop();

			this.current = this.$el.find('input').val();
			this.filter();

			return this;
		}
	});

	return ViewListFilter;
});
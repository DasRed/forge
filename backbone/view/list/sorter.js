'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/backbone/collection',
	'forge/backbone/view',
	'text!forge/backbone/view/list/template/sorter.html'
], function(
	lodash,
	jQuery,
	Collection,
	View,
	templateViewListSorter
)
{
	var ViewListSorter = View.extend(
	{
		/**
		 * collection for sort
		 *
		 * @var {Collection}
		 */
		collection: null,

		/**
		 * current sort property
		 *
		 * @var {String}
		 */
		current: null,

		/**
		 * current direction
		 *
		 * @var {String}
		 */
		direction: 'asc',

		/**
		 * @var {Object}
		 */
		events:
		{
			'click .direction, tap .direction': 'onClickDirection',
			'click .selector, tap .selection': 'onClickSelector',
			'click .selection a[data-property], tap .selection a[data-property]': 'onClickSelection'
		},

		/**
		 * selection is open
		 *
		 * @var {Boolean}
		 */
		isOpen: false,

		/**
		 * properties for sorting
		 *
		 * @var {Object}
		 */
		properties: null,

		/**
		 * @var {String}
		 */
		template: templateViewListSorter,

		/**
		 * comparator function
		 *
		 * @param {Model} modelA
		 * @param {Model} modelB
		 * @returns {Number}
		 */
		comparator: function(modelA, modelB)
		{
			var result = 0;
			var property = this.current;

			if (modelA.attributes[property] < modelB.attributes[property])
			{
				result = -1;
			}
			else if (modelA.attributes[property] > modelB.attributes[property])
			{
				result = 1;
			}

			if (this.direction === 'desc')
			{
				result *= -1;
			}

			return result;
		},

		/**
		 * init
		 *
		 * @returns {ViewListSorter}
		 */
		initialize: function()
		{
			View.prototype.initialize.apply(this, arguments);

			// validate
			if ((this.properties instanceof Object) === false || lodash.keys(this.properties).length === 0)
			{
				throw new Error('No properties are defined to sort or properties must be instance of Object.');
			}

			// validate
			if ((this.collection instanceof Collection) === false)
			{
				throw new Error('No collection is defined to sort or collection must be instance of Collection.');
			}

			// set current sort property
			if (this.current === null && typeof this.collection.comparator === 'string')
			{
				this.current = this.collection.comparator
			}
			if (this.current === null)
			{
				this.current = lodash.keys(this.properties)[0];
			}

			// set comparator
			this.collection.comparator = this.comparator.bind(this);

			// translate properties text
			this.properties = lodash.mapValues(this.properties, function(propertyText)
			{
				return this.translate(propertyText);
			}, this);

			return this;
		},

		/**
		 * on click to toggle the direction
		 *
		 * @returns {ViewListSorter}
		 */
		onClickDirection: function(event)
		{
			event.stop();

			this.direction = this.direction === 'asc' ? 'desc' : 'asc';
			this.$el.find('.direction').removeClass('asc desc').addClass(this.direction);

			this.collection.sort();

			return this;
		},

		/**
		 * on click to change current property
		 *
		 * @returns {ViewListSorter}
		 */
		onClickSelection: function(event)
		{
			event.stop();

			this.isOpen = false;
			this.$el.find('.selection').removeClass('show');

			this.current = jQuery(event.target).data('property');
			this.$el.find('.fieldName').html(this.properties[this.current]);

			this.collection.sort();

			return this;
		},

		/**
		 * on click to open the selection
		 *
		 * @returns {ViewListSorter}
		 */
		onClickSelector: function(event)
		{
			event.stop();

			if (this.isOpen === true)
			{
				this.isOpen = false;
				this.$el.find('.selection').removeClass('show');
			}
			else
			{
				this.$el.find('.selection').addClass('show');
				this.isOpen = true;
			}

			return this;
		},

		/**
		 * render
		 *
		 * @returns {ViewListSorter}
		 */
		render: function()
		{
			var self = this;

			View.prototype.render.call(this,
			{
				currentText: this.properties[this.current]
			});

			// on entry... no field selection
			if (lodash.size(this.properties) <= 1)
			{
				this.$el.find('.selector').hide();
			}
			// with more then one property
			else
			{
				jQuery(document).on('click', function(event)
				{
					if (self.isOpen === true)
					{
						var element = jQuery(event.target);

						if (element.hasClass('selectLink') === false)
						{
							event.stop();
						}

						self.isOpen = false;
						self.$el.find('.selection').removeClass('show');
					}
				});
			}
			return this;
		}
	});

	return ViewListSorter;
});
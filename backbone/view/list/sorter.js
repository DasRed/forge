'use strict';

define(
[
	'require',
	'lodash',
	'jQuery',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/collection/sorter',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'text!forge/backbone/view/list/template/sorter.html'
], function(
	require,
	lodash,
	jQuery,
	compatibility,
	Collection,
	CollectionSorter,
	View,
	ViewList,
	templateViewListSorter
)
{
	/**
	 * view list sorted
	 *
	 * @param {Object} Options
	 * @returns {ViewListSorter}
	 */
	var ViewListSorter = function(options)
	{
		if (ViewList === undefined)
		{
			ViewList = require('forge/backbone/view/list');
		}

		// templating
		this.template = templateViewListSorter;

		// parent
		View.apply(this, arguments);

		// validate
		if ((this.view instanceof ViewList) === false && (this.view instanceof ViewList) === false)
		{
			throw new Error('For a list sorter must be the view property a instance of ViewList!');
		}

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

		// translate properties text
		this.properties = lodash.mapValues(this.properties, function(propertyText)
		{
			return this.translate(propertyText);
		}, this);

		// direction
		if (options.direction !== undefined)
		{
			this.setDirection(options.direction);
		}

		// property
		if (options.property !== undefined)
		{
			this.setProperty(options.property);
		}

		return this;
	};

	// prototype
	ViewListSorter.prototype = Object.create(View.prototype,
	{
		/**
		 * collection for sort
		 *
		 * @var {Collection}
		 */
		collection:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this.view.collection;
			}
		},

		/**
		 * @var {Object}
		 */
		events:
		{
			value:
			{
				'click .direction, tap .direction': 'onClickDirection',
				'click .selector, tap .selection': 'onClickSelector',
				'click .selection a[data-property], tap .selection a[data-property]': 'onClickSelection'
			},
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * selection is open
		 *
		 * @var {Boolean}
		 */
		isOpen:
		{
			value: false,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * properties for sorting
		 *
		 * @var {Object}
		 */
		properties:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * view to sort
		 *
		 * @var {ViewList}
		 */
		view:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * on click to toggle the direction
	 *
	 * @param {jQuery.Event} event
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickDirection = function(event)
	{
		event.stop();

		this.setDirection(this.collection.sorter.direction === CollectionSorter.DIRECTION_ASC ? CollectionSorter.DIRECTION_DESC : CollectionSorter.DIRECTION_ASC);

		return this;
	};

	/**
	 * on click to change sort property
	 *
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickSelection = function(event)
	{
		event.stop();

		this.setProperty(jQuery(event.target).data('property'));

		return this;
	};

	/**
	 * on click to open the selection
	 *
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickSelector = function(event)
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
	};

	/**
	 * render
	 *
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.render = function()
	{
		var self = this;

		View.prototype.render.call(this,
		{
			currentText: this.properties[this.collection.sorter.property]
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
	};

	/**
	 * @param {String} direction
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.setDirection = function(direction)
	{
		this.$el.find('.direction').removeClass(CollectionSorter.DIRECTION_ASC + ' ' + CollectionSorter.DIRECTION_DESC).addClass(direction);

		this.collection.sorter.direction = direction;

		return this;
	};

	/**
	 * @param {String} property
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.setProperty = function(property)
	{
		this.isOpen = false;

		this.$el.find('.selection').removeClass('show');
		this.$el.find('.fieldName').html(this.properties[property]);

		this.collection.sorter.property = property;

		return this;
	};

	return compatibility(ViewListSorter);
});
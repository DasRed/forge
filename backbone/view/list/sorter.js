'use strict';

define(
[
	'require',
	'lodash',
	'jQuery',
	'forge/collator',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'text!forge/backbone/view/list/template/sorter.html'
], function(
	require,
	lodash,
	jQuery,
	collator,
	compatibility,
	Collection,
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
		 * current sort property
		 *
		 * @var {String}
		 */
		current:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * current direction
		 *
		 * @var {String}
		 */
		direction:
		{
			value: 'asc',
			enumerable: true,
			configurable: true,
			writable: true
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
	 * comparator function
	 *
	 * @param {Model} modelA
	 * @param {Model} modelB
	 * @returns {Number}
	 */
	ViewListSorter.prototype.comparator = function(modelA, modelB)
	{
		return collator.compareModels(this.current, modelA, modelB, this.direction);
	};

	/**
	 * on click to toggle the direction
	 *
	 * @param {jQuery.Event} event
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickDirection = function(event)
	{
		event.stop();

		this.direction = this.direction === 'asc' ? 'desc' : 'asc';
		this.$el.find('.direction').removeClass('asc desc').addClass(this.direction);

		this.collection.sort();

		return this;
	};

	/**
	 * on click to change current property
	 *
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickSelection = function(event)
	{
		event.stop();

		this.isOpen = false;
		this.$el.find('.selection').removeClass('show');

		this.current = jQuery(event.target).data('property');
		this.$el.find('.fieldName').html(this.properties[this.current]);

		this.collection.sort();

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
	};

	return compatibility(ViewListSorter);
});
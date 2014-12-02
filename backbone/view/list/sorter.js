'use strict';

define(
[
	'require',
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'tpl!forge/backbone/view/list/template/sorter'
], function(
	require,
	lodash,
	compatibility,
	Collection,
	View,
	ViewList,
	tplViewListSorter
)
{
	/**
	 * view list sorted
	 *
	 * @param {Object} Options
	 */
	function ViewListSorter(options)
	{
		if (ViewList === undefined)
		{
			ViewList = require('forge/backbone/view/list');
		}

		// templating
		this.template = tplViewListSorter;

		// parent
		View.apply(this, arguments);

		// validate
		if ((this.view instanceof ViewList) === false && (this.view instanceof ViewList) === false)
		{
			throw new Error('For a list sorter must be the view property a instance of ViewList!');
		}

		// validate
		if ((this.properties instanceof Object) === false || Object.keys(this.properties).length === 0)
		{
			throw new Error('No properties are defined to sort or properties must be instance of Object.');
		}

		// validate
		if ((this.collection instanceof Collection) === false)
		{
			throw new Error('No collection is defined to sort or collection must be instance of Collection.');
		}

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
	}

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
	 * @param {Event} event
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickDirection = function(event)
	{
		this.setDirection(this.collection.direction === Collection.DIRECTION_ASC ? Collection.DIRECTION_DESC : Collection.DIRECTION_ASC);

		return this;
	};

	/**
	 * on click to change sort property
	 *
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickSelection = function(event)
	{
		this.setProperty(event.target.getAttribute('data-property'));

		return this;
	};

	/**
	 * on click to open the selection
	 *
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.onClickSelector = function(event)
	{
		var fn = 'add';

		if (this.isOpen === true)
		{
			fn = 'remove';
			this.isOpen = false;
		}
		else
		{
			fn = 'add';
			this.isOpen = true;
		}

		var elements = this.el.querySelectorAll('.selection');
		for (var i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList[fn]('show');
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
			currentText: this.properties[this.collection.comparator]
		});

		// on entry... no field selection
		if (lodash.size(this.properties) <= 1)
		{
			var elements = this.el.querySelectorAll('.selector');
			for (var i = 0, length = elements.length; i < length; i++)
			{
				elements[i].style.display = 'none';
			}
		}
		// with more then one property
		else
		{
			document.addEventListener('click', function(event)
			{
				if (self.isOpen === true)
				{
					if (event.target.classList.contains('selectLink') === false)
					{
						return;
					}

					self.isOpen = false;
					var elements = self.el.querySelectorAll('.selection');
					for (var i = 0, length = elements.length; i < length; i++)
					{
						elements[i].classList.remove('show');
					}
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
		var elements = this.el.querySelectorAll('.direction');
		for (var i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList.remove(Collection.DIRECTION_ASC, Collection.DIRECTION_DESC);
			elements[i].classList.add(direction);
		}

		this.collection.direction = direction;

		return this;
	};

	/**
	 * @param {String} property
	 * @returns {ViewListSorter}
	 */
	ViewListSorter.prototype.setProperty = function(property)
	{
		this.isOpen = false;

		var elements = this.el.querySelectorAll('.selection');
		for (var i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList.remove('show');
		}

		elements = this.el.querySelectorAll('.fieldName');
		for (i = 0, length = elements.length; i < length; i++)
		{
			elements[i].innerHTML = this.properties[property];
		}

		this.collection.comparator = property;

		return this;
	};

	return compatibility(ViewListSorter);
});
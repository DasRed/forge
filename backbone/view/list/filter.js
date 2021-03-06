'use strict';

define(
[
	'require',
	'lodash',
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/view',
	'forge/backbone/view/list',
	'tpl!forge/backbone/view/list/template/filter'
], function(
	require,
	lodash,
	compatibility,
	Collection,
	View,
	ViewList,
	tplViewListFilter
)
{
	/**
	 * view list sorted
	 *
	 * @param {Object} Options
	 */
	function ViewListFilter(options)
	{
		if (ViewList === undefined)
		{
			ViewList = require('forge/backbone/view/list');
		}

		// elayed filtering
		this.filter = lodash.debounce(this.filter.bind(this), 100);

		// templating
		this.template = tplViewListFilter;

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
			throw new Error('No properties are defined to filter or properties must be instance of Object.');
		}

		// prefilter
		this.filter();

		// events
		this.collection.on('add', this.filter, this);
		this.collection.on('reset', this.filter, this);
		this.view.on('renderEntry', this.filter, this);
	}

	// prototype
	ViewListFilter.prototype = Object.create(View.prototype,
	{
		/**
		 * collection for filter
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
		 * element with the list
		 *
		 * @var {Element}
		 */
		containerList:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this.view.el;
			}
		},

		/**
		 * current filter value
		 *
		 * @var {String}
		 */
		current:
		{
			value: '',
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
				'click .clear, tap .clear': 'onClickClear',
				'keyup input': 'onKeyUpInput'
			},
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * properties for sorting
		 *
		 * @var {Object}|{Array}
		 */
		properties:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * view to filter
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
	 * filters
	 *
	 * @note this parameters comes with the event but are not used
	 * @param {ViewList} viewList
	 * @param {ViewListEntry} viewListEntry
	 * @param {Model} model
	 * @returns {ViewListFilter}
	 */
	ViewListFilter.prototype.filter = function()
	{
		var elements = this.containerList.querySelectorAll('[data-model-cid]');
		for (var i = 0, length = elements.length; i < length; i++)
		{
			elements[i].classList.remove('filtered');
		}

		if (this.current === '')
		{
			return this;
		}

		var regexp = new RegExp(this.current, 'i');
		var collectionLength = this.collection.length;
		var collectionModel = undefined;
		var i = undefined;
		var result = undefined;
		for (i = 0; i < collectionLength; i++)
		{
			collectionModel = this.collection.models[i];
			result = lodash.find(this.properties, function(propertyActive, propertyName)
			{
				if (propertyActive === false)
				{
					return false;
				}

				return regexp.test(String(this[propertyName]));
			}, collectionModel.attributes);

			// model does not match... hide view
			if (result === undefined)
			{
				elements = this.containerList.querySelectorAll('[data-model-cid="' + collectionModel.cid + '"]');
				for (i = 0, length = elements.length; i < length; i++)
				{
					elements[i].classList.add('filtered');
				}
			}
		}

		return this;
	};

	/**
	 *
	 * @returns {ViewListFilter}
	 */
	ViewListFilter.prototype.initialize = function()
	{
		View.prototype.initialize.apply(this, arguments);

		// convert properties array to object
		if (lodash.isArray(this.properties) === true)
		{
			this.properties = lodash.reduce(this.properties, function(acc, propertyName)
			{
				acc[propertyName] = true;

				return acc;
			}, {});
		}

		return this;
	};

	/**
	 * clears the filter
	 *
	 * @returns {ViewListFilter}
	 */
	ViewListFilter.prototype.onClickClear = function(event)
	{
		this.current = '';
		this.el.querySelector('input').value = this.current;

		this.filter();

		return this;
	};

	/**
	 * on click to change current property
	 *
	 * @returns {ViewListFilter}
	 */
	ViewListFilter.prototype.onKeyUpInput = function(event)
	{
		this.current = this.el.querySelector('input').value;
		this.filter();

		return this;
	};

	return compatibility(ViewListFilter);
});
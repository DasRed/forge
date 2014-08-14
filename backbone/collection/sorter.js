'use strict';

define(
[
	'forge/object/base'
], function(
	Base
)
{
	var collator = undefined;

	/**
	 * @param {Object} options
	 * @returns {CollectionSorter}
	 */
	var CollectionSorter = function(options)
	{
		this.compare = this.compare.bind(this);

		Base.apply(this, arguments);

		this._property = this.collection.comparator;
		this._direction = this.collection.direction;

		var self = this;
		// wrap collection properties COMPARATOR so that the sorter knows if it changed
		Object.defineProperty(this.collection, 'comparator',
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return self._property;
			},
			set: function(property)
			{
				if (self._property !== property)
				{
					self._property = property;
					self.sort();
				}
			}
		});

		// wrap collection properties DIRECTION so that the sorter knows if it changed
		Object.defineProperty(this.collection, 'direction',
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._direction;
			},
			set: function(direction)
			{
				if (self._direction !== direction)
				{
					self._direction = direction;
					self.sort();
				}
			}
		});

		return this;
	};

	CollectionSorter.DIRECTION_ASC = 'asc';
	CollectionSorter.DIRECTION_DESC = 'desc';

	// prototype
	CollectionSorter.prototype = Object.create(Base.prototype,
	{
		/**
		 * collection for sort
		 *
		 * @var {Collection}
		 */
		collection:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * current direction
		 *
		 * @var {String}
		 */
		direction:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._direction === undefined)
				{
					return CollectionSorter.DIRECTION_ASC;
				}

				return this._direction;
			},
			set: function(direction)
			{
				if (this._direction !== direction)
				{
					this._direction = direction;
					this.sort();
				}
			}
		},

		/**
		 * current sort property
		 *
		 * @var {String}
		 */
		property:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._property;
			},
			set: function(property)
			{
				if (this._property !== property)
				{
					this._property = property;
					this.sort();
				}
			}
		}
	});

	/**
	 * compare function
	 *
	 * @param {Model} modelA
	 * @param {Model} modelB
	 * @returns {Number}
	 */
	CollectionSorter.prototype.compare = function(modelA, modelB)
	{
		var propertyName = this.property;
		var direction = this.direction;

		var valueA = modelA.attributes[propertyName];
		var valueB = modelB.attributes[propertyName];

		var result = 0;

		// use natural sort for strings
		if (typeof valueA === 'string' || typeof valueB === 'string')
		{
			if (collator === undefined)
			{
				collator = new Intl.Collator();
			}
			result = collator.compare(valueA, valueB);
		}
		// use direct value compare
		else if (valueA < valueB)
		{
			result = -1;
		}
		else if (valueA > valueB)
		{
			result = 1;
		}

		// reverse sort?
		if (direction == CollectionSorter.DIRECTION_DESC)
		{
			result *= -1;
		}

		return result;
	};

	/**
	 * sorts the collection in sorter
	 *
	 * @returns {CollectionSorter}
	 */
	CollectionSorter.prototype.sort = function()
	{
		if (this.collection === undefined || this.collection.models === null || this.collection.models === undefined || this.collection.models.length === 0)
		{
			return this;
		}

		this.collection.models.sort(this.compare);

		return this;
	};

	return CollectionSorter;
});
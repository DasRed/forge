'use strict';

define(
[
	'forge/object/base',
	'forge/collator'
], function(
	Base,
	collator
)
{
	/**
	 * @param {Object} options
	 * @returns {CollectionSorter}
	 */
	var CollectionSorter = function(options)
	{
		Base.apply(this, arguments);

		return this;
	};

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
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._collection;
			},
			set: function(collection)
			{
				if (this._collection !== undefined)
				{
					this._collection.comparator = this.property;
				}

				this._collection = collection;
				this._property = this._collection.comparator;
				this._collection.comparator = (function(modelA, modelB)
				{
					return collator.compareModels(this.property, modelA, modelB, this.direction);
				}).bind(this);
			}
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
				if (typeof direction === 'string')
				{
					direction = direction.toLowerCase();
				}

				if (direction !== CollectionSorter.DIRECTION_ASC && direction !== CollectionSorter.DIRECTION_DESC)
				{
					direction = CollectionSorter.DIRECTION_ASC;
				}

				if (this._direction !== direction)
				{
					this._direction = direction;
					this.collection.sort();
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
					this.collection.sort();
				}
			}
		}
	});

	CollectionSorter.DIRECTION_ASC = 'asc';
	CollectionSorter.DIRECTION_DESC = 'desc';

	return CollectionSorter;
});
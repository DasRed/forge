'use strict';

define(
[
	'forge/backbone/compatibility',
	'forge/backbone/collection'
], function(
	compatibility,
	Collection
)
{

	/**
	 * Collection with limit for Models
	 *
	 * @param {Array} models
	 * @param {Object} options
	 */
	function CollectionLimit(models, options)
	{
		Collection.apply(this, arguments);
	}

	// prototype
	CollectionLimit.prototype = Object.create(Collection.prototype,
	{
		/**
		 * defines the limit to request
		 *
		 * @var {Number}
		 */
		limit:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._limit === undefined)
				{
					return this.limitDefault;
				}

				return this._limit;
			},
			set: function(limit)
			{
				if (limit <= 0 || limit === undefined || limit == null)
				{
					this._limit = null;
					this._offset = null;
				}
				else
				{
					this._limit = limit;
					if (this._offset === null)
					{
						this._offset = undefined;
					}
				}

				this.reset();
				this.fetch();
			}
		},

		/**
		 * default limit
		 *
		 * @var {Number}
		 */
		limitDefault:
		{
			value: 25,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the offset for request
		 *
		 * @var {Number}
		 */
		offset:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._offset === undefined)
				{
					return this.offsetDefault;
				}

				return this._offset;
			},
			set: function(offset)
			{
				if (offset <= 0 || offset === undefined || offset == null)
				{
					this._offset = null;
				}
				else
				{
					this._offset = offset;
				}

				this.reset();
				this.fetch();
			}
		},

		/**
		 * default offset
		 *
		 * @var {Number}
		 */
		offsetDefault:
		{
			value: 0,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	return compatibility(CollectionLimit);
});
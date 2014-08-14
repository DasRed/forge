'use strict';

define(
[
	'forge/object/iterator'
], function(
	Iterator
)
{
	/**
	 * @param {Object} options
	 */
	function Queue(options)
	{
		Iterator.apply(this, arguments);
	}

	//prototype
	Queue.prototype = Object.create(Iterator.prototype,
	{
		/**
		 * @var {Boolean}
		 */
		autoRun:
		{
			value: true,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * enables or disables the queue
		 */
		enabled:
		{
			value: true,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Boolean}
		 */
		isRunning:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return false;
			}
		}
	});

	/**
	 * runs the next entry
	 *
	 * @param {String} key
	 * @param {Function} entry
	 * @returns {Queue}
	 */
	Queue.prototype.add = function(key, entry)
	{
		if (this.enabled === false)
		{
			entry.apply(this, [this]);
			return this;
		}

		if ((entry instanceof Function) === false)
		{
			throw new Error('The entry for the queue must be a function.');
		}

		Iterator.prototype.add.apply(this, arguments);

		// starts automatically but only if it is currently not running
		if (this.autoRun === true && this.isRunning === false)
		{
			this.run();
		}

		return this;
	};

	/**
	 * runs the queue
	 *
	 * @returns {Queue}
	 */
	Queue.prototype.run = function()
	{
		// nothing to do
		if (this.length === 0 || this.isRunning === true)
		{
			return this;
		}

		return this.runner();
	};

	/**
	 * runs every entry in the queu
	 *
	 * @returns {Queue}
	 */
	Queue.prototype.runner = function()
	{
		while (this.length > 0)
		{
			this.runNext();
		}

		return this;
	};

	/**
	 * runs the next entry
	 *
	 * @returns {Queue}
	 */
	Queue.prototype.runNext = function()
	{
		// nothing to do
		if (this.length == 0)
		{
			return this;
		}

		var key = this.keys()[0];
		var entry = this.get(key);
		this.remove(key);

		entry.apply(this, [this]);

		return this;
	};

	return Queue;
});

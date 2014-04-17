'use strict';

define(
[
	'forge/queue'
], function(
	Queue
)
{
	/**
	 * @param {Object} options
	 * @returns {QueueTimeout}
	 */
	var QueueTimeout = function(options)
	{
		Queue.apply(this, arguments);

		return this;
	};

	// prototype
	QueueTimeout.prototype = Object.create(Queue.prototype,
	{
		/**
		 * @var {Date}
		 */
		dateStart:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Number}
		 */
		delay:
		{
			value: 100,
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
				return this.timer !== null && this.timer !== undefined;
			}
		},

		/**
		 * @var {Number}
		 */
		timer:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return this._timer;
			},
			set: function(timer)
			{
				if (this._timer !== undefined && this._timer !== null)
				{
					clearTimeout(this._timer);
				}

				this._timer = timer;
			}
		},

		/**
		 * timeout in milliseconds after the queue run stops and waits for given delay
		 *
		 * @var {Number}
		 */
		timeout:
		{
			value: 200,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * pause the queue
	 *
	 * @returns {QueueTimeout}
	 */
	QueueTimeout.prototype.pause = function()
	{
		this.timer = setTimeout(this.runner.bind(this), this.delay);

		return this;
	};

	/**
	 * runs the queue
	 *
	 * @returns {QueueTimeout}
	 */
	QueueTimeout.prototype.runner = function()
	{
		this.start();

		// runs
		while (this.length > 0)
		{
			this.runNext();
			if (new Date() - this.dateStart > this.timeout)
			{
				console.debug('Delaying the next ' + this.length + ' entries.');
				return this.pause();
			}
		}

		// all done... stop
		this.stop();

		return this;
	};

	/**
	 * start
	 *
	 * @returns {QueueTimeout}
	 */
	QueueTimeout.prototype.start = function()
	{
		this.dateStart = new Date();
		this.timer = null;

		return this;
	};

	/**
	 * stops
	 *
	 * @returns {QueueTimeout}
	 */
	QueueTimeout.prototype.stop = function()
	{
		this.dateStart = null;
		this.timer = null;

		return this;
	};

	return QueueTimeout
});
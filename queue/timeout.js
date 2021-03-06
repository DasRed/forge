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
	 */
	function QueueTimeout(options)
	{
		Queue.apply(this, arguments);
	}

	// prototype
	QueueTimeout.prototype = Object.create(Queue.prototype,
	{
		/**
		 * @var {Date}
		 */
		dateLastRun:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

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
			value: 500,
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
		var self = this;
		this.timer = setTimeout(function()
		{
			self.stop();
			self.runner();
		}, this.delay);

		return this;
	};

	/**
	 * runs the queue
	 *
	 * @returns {QueueTimeout}
	 */
	QueueTimeout.prototype.run = function()
	{
		if (this.dateStart !== null)
		{
			// stop and restart
			if (new Date() - this.dateLastRun > this.delay)
			{
				this.stop();
			}
			// test for delaying
			else if (new Date() - this.dateStart > this.timeout)
			{
				console.debug('Delaying the next ' + this.length + ' entries.');
				return this.pause();
			}
		}

		// nothing to do
		if (this.length === 0 || this.isRunning === true)
		{
			return this;
		}

		this.runner();

		return this;
	};

	/**
	 * runs the queue
	 *
	 * @returns {QueueTimeout}
	 */
	QueueTimeout.prototype.runner = function()
	{
		var lengthBefore = this.length;

		// only start if not started
		if (this.dateStart === null)
		{
			this.start();
		}

		// runs
		while (this.length > 0)
		{
			this.runNext();
			this.dateLastRun = new Date();

			if (this.dateLastRun - this.dateStart > this.timeout)
			{
				if (this.length > 0)
				{
					console.debug('Handled ' + (lengthBefore - this.length) + ' entries. Delaying the next ' + this.length + ' entries.');
					return this.pause();
				}

				console.debug('Handled ' + (lengthBefore - this.length) + ' entries.');
				return this;
			}
		}

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

	return QueueTimeout;
});
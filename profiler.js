'use strict';

define(
[
	'jQuery',
	'cfg!application',
	'forge/object/base'
], function(
	jQuery,
	configApplication,
	Base
)
{
	/**
	 * @param {Object} options
	 */
	function Profiler(options)
	{
		Base.apply(this, arguments);
	}

	// prototype
	Profiler.prototype = Object.create(Base.prototype,
	{
		/**
		 * @var {Array}
		 */
		lastText:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._lastText === undefined)
				{
					this._lastText = [];
				}

				return this._lastText;
			}
		},

		/**
		 * @var {Object}
		 */
		profiles:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				if (this._profiles === undefined)
				{
					this._profiles = {};
				}

				return this._profiles;
			}
		},

		/**
		 * @var {Boolean}
		 */
		sendToServer:
		{
			value: false,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		serverUrl:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * profiling timeout in milliseconds
		 * to disable timeout, set to false or 0
		 *
		 * @var {Number}
		 */
		timeout:
		{
			value: 10 * 1000,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * timer for timeouts
		 *
		 * @var {Number}
		 */
		timer:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * clears a id
	 *
	 * @param {String} id
	 * @returns {Profiler}
	 */
	Profiler.prototype.clear = function(id)
	{
		if (this.profiles[id] !== undefined)
		{
			delete this.profiles[id];

			this.stopTimer();
		}

		return this;
	};

	/**
	 * create the id
	 *
	 * @param {String} id
	 * @returns {Profiler}
	 */
	Profiler.prototype.create = function(id)
	{
		if (this.profiles[id] === undefined)
		{
			this.profiles[id] =
			{
				date: null,
				running: false,
				totalTime: 0
			};
		}

		return this;
	};

	/**
	 * retrieves the current time without stopping
	 *
	 * @param {String} id
	 * @param {Boolean} clear default is FALSE
	 * @returns {Number}
	 */
	Profiler.prototype.getTime = function(id, clear)
	{
		if (this.profiles[id] === undefined)
		{
			return 0;
		}

		var time = this.profiles[id].totalTime;
		if (this.profiles[id].running === true)
		{
			time += (new Date()) - this.profiles[id].date;
		}

		if (clear === true)
		{
			this.clear(id);
		}

		return time;
	};

	/**
	 * log message
	 *
	 * @param {String} id
	 * @param {Number} duration
	 * @param {String} message
	 * @returns {Profiler}
	 */
	Profiler.prototype.log = function(id, duration, message)
	{
		var prefix = 'Profiling [' + id + ']:';
		var warnLevel = console.LEVEL_INFO;

		var messageText = message !== undefined ? ' ' + message : '';

		if (duration === undefined)
		{
			messageText = prefix + messageText;
		}
		else
		{
			messageText = prefix + ' ' + duration + ' ms' + messageText;
		}

		// no time given
		if (duration === undefined)
		{
			console.infoPink(this, messageText);
		}
		// time test 0 .. 9 ms
		else if (duration < 10)
		{
			console.infoGrey(this, messageText);
		}
		// time test 10 .. 199 ms
		else if (duration < 200)
		{
			console.infoGreen(this, messageText);
		}
		// time test 200 .. 299 ms
		else if (duration < 300)
		{
			warnLevel = console.LEVEL_NOTICE;
			console.noticeBlue(this, messageText);
		}
		// time test 300 .. 499 ms
		else if (duration < 500)
		{
			warnLevel = console.LEVEL_NOTICE;
			console.noticeTurquoise(this, messageText);
		}
		// time test 500 .. 699 ms
		else if (duration < 700)
		{
			warnLevel = console.LEVEL_WARN;
			console.warnYellow(this, messageText);
		}
		// time test 700 .. 999 ms
		else if (duration < 1000)
		{
			warnLevel = console.LEVEL_ALERT;
			console.alertPink(this, messageText);
		}
		// time test 1000+ ms
		else
		{
			warnLevel = console.LEVEL_CRITICAL;
			console.criticalRed(this, messageText);
		}

		// send to server
		if (duration !== undefined && this.sendToServer === true)
		{
			jQuery.ajax(
			{
				url: this.serverUrl,
				method: 'POST',
				data:
				{
					id: id,
					warnLevel: warnLevel,
					duration: duration,
					message: message !== undefined ? message : '',
					timestamp: (new Date()).toISOString()
				}
			});
		}

		return this;
	};

	/**
	 * pause a entry
	 *
	 * @param {String} id
	 * @param {String} message
	 * @returns {Profiler}
	 */
	Profiler.prototype.pause = function(id, message)
	{
		if (this.profiles[id] === undefined)
		{
			return this;
		}

		this.profiles[id].totalTime = this.getTime(id);
		this.profiles[id].running = false;

		if (message !== undefined)
		{
			this.log(id, this.getTime(id), message);
		}

		return this;
	};

	/**
	 * starts
	 *
	 * @param {String} id
	 * @param {String} message
	 * @returns {Profiler}
	 */
	Profiler.prototype.start = function(id, message)
	{
		this.create(id);

		this.profiles[id].date = new Date();
		this.profiles[id].running = true;

		this.startTimer();

		if (message !== undefined)
		{
			this.log(id, undefined, message);
		}

		return this;
	};

	/**
	 * timer start for timeouts if not a timer is setted
	 *
	 * @returns {Profiler}
	 */
	Profiler.prototype.startTimer = function()
	{
		var self = this;
		if (this.timer === null && this.timeout !== false && this.timeout > 0)
		{
			// set timer to test timeouted timers
			this.timer = setInterval(function()
			{
				var id = undefined;
				for (id in self.profiles)
				{
					if (self.profiles[id].running === true && self.getTime(id) > self.timeout)
					{
						self.stop(id, 'Profiling is timed out. Timeout is ' + self.timeout + ' ms.');
					}
				}
			}, 1000);
		}

		return this;
	};

	/**
	 * stops
	 *
	 * @param {String} id
	 * @param {String} message
	 * @returns {Profiler}
	 */
	Profiler.prototype.stop = function(id, message)
	{
		return this.time(id, message).clear(id);
	};

	/**
	 * stop the timer if no profiling is active
	 *
	 * @returns {Profiler}
	 */
	Profiler.prototype.stopTimer = function()
	{
		if (this.timer !== null && Object.keys(this.profiles).length == 0)
		{
			clearInterval(this.timer);
			this.timer = null;
		}

		return this;
	};

	/**
	 * retrieves the current time on console without stopping
	 *
	 * @param {String} id
	 * @param {String} message
	 * @returns {Profiler}
	 */
	Profiler.prototype.time = function(id, message)
	{
		if (this.profiles[id] === undefined)
		{
			return this;
		}

		this.log(id, this.getTime(id), message);

		return this;
	};

	// create default Profiler
	window.Profiler = new Profiler(configApplication.profiling);

	return Profiler;
});
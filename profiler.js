'use strict';

require(
[
	'lodash',
	'jQuery',
	'cfg!application'
], function(
	lodash,
	jQuery,
	configApplication
)
{
	var config = configApplication.profiling;

	/**
	 * small profiler
	 */
	window.Profiler =
	{

		/**
		 * @var {Array}
		 */
		lastText: [],

		/**
		 * @var {Object}
		 */
		profiles: {},

		/**
		 * profiling timeout in milliseconds
		 *
		 * @var {Number}
		 */
		timeout: 10 * 1000,

		/**
		 * timer for timeouts
		 *
		 * @var {Number}
		 */
		timer: null,

		/**
		 * clears a id
		 *
		 * @param {String} id
		 * @returns {Profiler}
		 */
		clear: function(id)
		{
			if (this.profiles[id] !== undefined)
			{
				delete this.profiles[id];

				this.stopTimer();
			}

			return this;
		},

		/**
		 * retrieves the current time without stopping
		 *
		 * @param {String} id
		 * @param {Boolean} clear default is FALSE
		 * @returns {Number}
		 */
		getTime: function(id, clear)
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
		},

		/**
		 * log message
		 *
		 * @param {String} id
		 * @param {Number} duration
		 * @param {String} message
		 * @returns {Profiler}
		 */
		log: function(id, duration, message)
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
			if (duration !== undefined && config.sendToServer === true)
			{
				jQuery.ajax(
				{
					url: config.serverUrl,
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
		},

		/**
		 * pause a entry
		 *
		 * @param {String} id
		 * @param {String} message
		 * @returns {Profiler}
		 */
		pause: function(id, message)
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
		},

		/**
		 * starts
		 *
		 * @param {String} id
		 * @param {String} message
		 * @returns {Profiler}
		 */
		start: function(id, message)
		{
			if (this.profiles[id] === undefined)
			{
				this.profiles[id] =
				{
					date: new Date(),
					running: true,
					totalTime: 0
				};
			}
			else
			{
				this.pause(id);
				this.profiles[id].date = new Date();
				this.profiles[id].running = true;
			}

			this.startTimer();

			if (message !== undefined)
			{
				this.log(id, undefined, message);
			}

			return this;
		},

		/**
		 * timer start for timeouts if not a timer is setted
		 *
		 * @returns {Profiler}
		 */
		startTimer: function()
		{
			var self = this;
			if (this.timer === null)
			{
				// set timer to test timeouted timers
				this.timer = setInterval(function()
				{
					var idsTimedOut = lodash.reduce(self.profiles, function(acc, data, id)
					{
						if (data.running === true && self.getTime(id) > self.timeout)
						{
							acc.push(id);
						}

						return acc;
					}, []);

					lodash.each(idsTimedOut, function(id)
					{
						self.stop(id, 'Profiling is timed out. Timeout is ' + self.timeout + ' ms.');
					});
				}, 1000);
			}

			return this;
		},

		/**
		 * stops
		 *
		 * @param {String} id
		 * @param {String} message
		 * @returns {Profiler}
		 */
		stop: function(id, message)
		{
			return this.time(id, message).clear(id);
		},

		/**
		 * stop the timer if no profiling is active
		 *
		 * @returns {Profiler}
		 */
		stopTimer: function()
		{
			if (this.timer !== null && lodash.keys(this.profiles).length == 0)
			{
				clearInterval(this.timer);
				this.timer = null;
			}

			return this;
		},

		/**
		 * retrieves the current time on console without stopping
		 *
		 * @param {String} id
		 * @param {String} message
		 * @returns {Profiler}
		 */
		time: function(id, message)
		{
			if (this.profiles[id] === undefined)
			{
				return this;
			}

			this.log(id, this.getTime(id), message);

			return this;
		}
	};
});
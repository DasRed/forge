'use strict';

define([], function()
{

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	/**
	 * @param {Base} obj
	 * @param {String} eventName
	 * @param {Function} callback
	 * @param {Object} context
	 */
	function removeEventsByEventName(obj, eventName, callback, context)
	{
		var events = undefined;
		var event = undefined;
		var j = undefined;
		var k = undefined;

		events = obj.events[eventName];
		obj.events[eventName] = [];
		if (callback || context)
		{
			for (j = 0, k = events.length; j < k; j++)
			{
				event = events[j];
				if ((callback && callback !== event.callback && callback !== event.callback._callback) || (context && context !== event.context))
				{
					obj.events[eventName].push(event);
				}
			}
		}

		if (obj.events[eventName].length == 0)
		{
			delete obj.events[eventName];
		}
	}

	/**
	 * base
	 *
	 * @param {Object} options
	 * 		every options will be copied to this instance
	 * 		magic options
	 * 			- on: bind every defined event to this instance.
	 */
	function Base(options)
	{
		this.events = {};

		options = options || {};

		// bind events
		if (options.on !== undefined)
		{
			this.on(options.on);
			delete options.on;
		}

		// bind events
		if (options.once !== undefined)
		{
			this.once(options.once);
			delete options.once;
		}

		// copy options
		for (var optionName in options)
		{
			if (optionName === 'events')
			{
				continue;
			}
			this[optionName] = options[optionName];
		}
	}

	// prototyping
	Base.prototype = Object.create(Object.prototype,
	{
		/**
		 * @var {Object}
		 */
		events:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * destroys the Base
	 *
	 * @returns {Base}
	 */
	Base.prototype.destroy = function()
	{
		// remove all events
		this.off();

		return this;
	};

	/**
	 *
	 * @param {String} eventName
	 * @param {Function} callback
	 * @param {Object} context
	 * @returns {Base}
	 */
	Base.prototype.off = function(eventName, callback, context)
	{
		// remove all events
		if (eventName === undefined && callback === undefined && context === undefined)
		{
			for (key in this.events)
			{
				delete this.events[key];
			}
		}

		// removes all events by eventName
		else if (eventName !== undefined && callback === undefined && context === undefined)
		{
			if (this.events[eventName] !== undefined)
			{
				delete this.events[eventName];
			}
		}

		// loop over all events
		else if (eventName === undefined)
		{
			for (var key in this.events)
			{
				removeEventsByEventName(this, key, callback, context);
			}
		}

		// only one specific event with additional informations
		else if (this.events[eventName] !== undefined)
		{
			removeEventsByEventName(this, eventName, callback, context);
		}

		return this;
	};

	/**
	 * creates one or more events
	 *
	 * @param {String}|{Object} name
	 * @param {Function} callback
	 * @param {Object} context
	 * @returns {Base}
	 */
	Base.prototype.on = function(eventName, callback, context)
	{
		// Handle event maps.
		if (typeof eventName === 'object')
		{
			for (var key in eventName)
			{
				this.on(key, eventName[key]);
			}

			return this;
		}

		// Handle space separated event names.
		if (eventSplitter.test(eventName) === true)
		{
			var eventNames = eventName.split(eventSplitter);
			for (var i = 0, l = eventNames.length; i < l; i++)
			{
				this.on(eventNames[i], callback, context);
			}
			return this;
		}

		// create new event entry
		if (this.events[eventName] === undefined)
		{
			this.events[eventName] = [];
		}

		// append the event
		this.events[eventName].push(
		{
			callback: callback,
			context: context,
			ctx: context || undefined
		});

		return this;
	};

	/**
	 * trigger
	 *
	 * @param {String} eventName
	 * @param {Mixed} ... additional n Parameters
	 * @returns {Mixed}
	 */
	Base.prototype.trigger = function(eventName, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10)
	{
		var events = this.events[eventName];
		if (events === undefined)
		{
			return undefined;
		}

		var i = undefined;
		var lengthEvents = events.length;
		var result = undefined;
		var event = undefined;
		var eventResult = undefined;

		var lengthParameters = arguments.length - 1;
		var parameters = undefined;

		if (lengthParameters > 10)
		{
			parameters = new Array(lengthParameters);
			// this is faster then Array.prototype.slice.call
			for (i = 0; i < lengthParameters; i++)
			{
				parameters[i] = arguments[i + 1];
			}
		}

		i = -1;
		while (++i < lengthEvents)
		{
			event = events[i];

			if (lengthParameters === 0) { eventResult = event.callback.call(event.ctx); }
			else if (lengthParameters === 1) { eventResult = event.callback.call(event.ctx, param1); }
			else if (lengthParameters === 2) { eventResult = event.callback.call(event.ctx, param1, param2); }
			else if (lengthParameters === 3) { eventResult = event.callback.call(event.ctx, param1, param2, param3); }
			else if (lengthParameters === 4) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4); }
			else if (lengthParameters === 5) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4, param5); }
			else if (lengthParameters === 6) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4, param5, param6); }
			else if (lengthParameters === 7) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4, param5, param6, param7); }
			else if (lengthParameters === 8) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4, param5, param6, param7, param8); }
			else if (lengthParameters === 9) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4, param5, param6, param7, param8, param9); }
			else if (lengthParameters === 10) { eventResult = event.callback.call(event.ctx, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10); }
			else { eventResult = event.callback.apply(event.ctx, parameters); }

			if (eventResult !== undefined)
			{
				result = eventResult;
			}
		}

		return result;
	};

	return Base;
});
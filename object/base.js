'use strict';

define(
[
	'jQuery'
], function(
	jQuery
)
{
	/**
	 * base
	 *
	 * @param {Object} options
	 * 		every options will be copied to this instance
	 * 		magic options
	 * 			- on: bind every defined event to this instance. see this.on Method Object style of jQuery.on
	 * @returns {Base}
	 */
	var Base = function(options)
	{
		this.registeredEventCounters = {};

		options = options || {};

		// bind events
		if (options.on !== undefined)
		{
			this.on(options.on);
			delete options.on;
		}

		// copy options
		jQuery.extend(this, options);

		return this;
	};

	// prototyping
	Base.prototype = Object.create(Object.prototype,
	{
		/**
		 * this object as jQuery Object
		 *
		 * @var {jQuery}
		 */
		jQueryObject:
		{
			configurable: true,
			enumerable: true,
			get: function()
			{
				if (this._jQueryObject === undefined)
				{
					this._jQueryObject = jQuery(this);
				}
				return this._jQueryObject;
			}
		},

		/**
		 * @var {Object}
		 */
		registeredEventCounters:
		{
			value: null,
			configurable: false,
			enumerable: false,
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
	 * defines, deletes and increment the registeredEventCounters
	 *
	 * @param {String}|{Array}|{Undefined} eventName
	 * @param [Number} increment
	 * @returns {Base}
	 */
	Base.prototype.incrementRegisteredEventCounter = function(eventName, increment)
	{
		// clear all
		if (eventName === undefined)
		{
			this.registeredEventCounters = {};
			return this;
		}

		// many events
		else if (typeof eventName === 'object')
		{
			for (var eventNameName in eventName)
			{
				this.incrementRegisteredEventCounter(eventNameName, increment);
			}
			return this;
		}

		// define
		if (this.registeredEventCounters[eventName] === undefined)
		{
			this.registeredEventCounters[eventName] = 0;
		}

		// increment by value
		this.registeredEventCounters[eventName] += increment;

		// if the counter is 0 or less zero delete the entry
		if (this.registeredEventCounters[eventName] <= 0)
		{
			delete this.registeredEventCounters[eventName];
		}

		return this;
	};

	/**
	 * off binding
	 *
	 * @see http://api.jquery.com/off/
	 * @param {Mixed} see jQuery.on
	 * @returns {Base}
	 */
	Base.prototype.off = function(events, selector, handler)
	{
		this.jQueryObject.off(events, selector, handler);

		this.incrementRegisteredEventCounter(events, -1);

		return this;
	};

	/**
	 * on binding
	 *
	 * @see http://api.jquery.com/on/
	 * @param {Mixed} see jQuery.on
	 * @returns {Base}
	 */
	Base.prototype.on = function(events, selector, data, handler)
	{
		this.incrementRegisteredEventCounter(events, 1);

		this.jQueryObject.on(events, selector, data, handler);

		return this;
	};

	/**
	 * trigger
	 *
	 * @see http://api.jquery.com/trigger/
	 * @param {String} eventName
	 * @param {Array} extraParameters
	 * @returns {Mixed}
	 */
	Base.prototype.trigger = function(eventName, extraParameters)
	{
		// no event to trigger
		if (this.registeredEventCounters[eventName] === undefined || this.registeredEventCounters[eventName] <= 0)
		{
			return undefined;
		}

		return this.jQueryObject.triggerHandler(eventName, extraParameters);
	};

	return Base;
});
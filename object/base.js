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
	 * off binding
	 *
	 * @see http://api.jquery.com/off/
	 * @param {Mixed} see jQuery.on
	 * @returns {Base}
	 */
	Base.prototype.off = function(events, selector, handler)
	{
		this.jQueryObject.off(events, selector, handler);

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
		this.jQueryObject.on(events, selector, data, handler);

		return this;
	};

	/**
	 * trigger
	 *
	 * @see http://api.jquery.com/trigger/
	 * @param {String} eventType
	 * @param {Array} extraParameters
	 * @returns {Mixed}
	 */
	Base.prototype.trigger = function(eventType, extraParameters)
	{
		return this.jQueryObject.triggerHandler(eventType, extraParameters);
	};

	return Base;
});
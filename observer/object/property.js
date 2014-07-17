'use strict';

define(
[
	'forge/object/base'
], function(
	Base
)
{
	/**
	 * property observer
	 *
	 * @param {Object} object
	 * @param {String} property
	 * @param {Object} options
	 * @returns {ObserverObjectProperty}
	 *
	 * @event {void} get({jQuery.Event}, {ObjectOfObservedProperty}, {PropertyName}, value [, PARAMETERS]) fires if some whants to get the value
	 * @event {mixed} get:before({jQuery.Event}, {ObjectOfObservedProperty}, {PropertyName} [, PARAMETERS]) fires before if some wants to get the value. if callback returns a value other then undefined, this value will be retruned from get
	 * @event {void} get:after({jQuery.Event}, {ObjectOfObservedProperty}, {PropertyName}, value [, PARAMETERS]) fires after if some wants to get the value.
	 *
	 * @event {void} set({jQuery.Event}, {ObjectOfObservedProperty}, {PropertyName}, newValue, oldValue) fires if some whants to set the value
	 * @event {boolean} set:before({jQuery.Event}, {ObjectOfObservedProperty}, {PropertyName}, newValue, oldValue) fires before if some wants to set the value. if callback returns FALSE the value will not be setted
	 * @event {void} set:after({jQuery.Event}, {ObjectOfObservedProperty}, {PropertyName}, newValue, oldValue) fires after if some wants to set the value.
	 *
	 * @example
	 * <code>
	 * 		var subject =
	 * 		{
	 * 			x: 10,
	 * 			y: function(a, b, c)
	 * 			{
	 * 				console.log('nuff', a, b, c);
	 * 			}
	 * 		};
	 *
	 * 		var observer = new ObserverObjectProperty(subject, 'x',
	 * 		{
	 * 			on:
	 * 			{
	 * 				'get': function(event, object, propertyName, value)
	 * 				{
	 * 					console.log('property: get', event, object, propertyName, value);
	 * 				},
	 * 				'get:before': function(event, object, propertyName)
	 * 				{
	 * 					console.log('property: get:before', event, object, propertyName);
	 * 				},
	 * 				'get:after': function(event, object, propertyName, value)
	 * 				{
	 * 					console.log('property: get:after', event, object, propertyName, value);
	 * 				},
	 * 				'set': function(event, object, propertyName, newValue, oldValue)
	 * 				{
	 * 					console.log('property: set', event, object, propertyName, newValue, oldValue);
	 * 				},
	 * 				'set:before': function(event, object, propertyName, newValue, oldValue)
	 * 				{
	 * 					console.log('property: set:before', event, object, propertyName, newValue, oldValue);
	 * 				},
	 * 				'set:after': function(event, object, propertyName, newValue, oldValue)
	 * 				{
	 * 					console.log('property: set:after', event, object, propertyName, newValue, oldValue);
	 * 				}
	 * 			}
	 * 		});
	 *
	 * 		subject.x = 9;
	 * 		subject.x = 10;
	 * 		var x = subject.x;
	 * 		subject.y();
	 *
	 * 		observer.unobserve();
	 * 		subject.x = 512;
	 *
	 * 		// outputs on console
	 * 		//
	 * 		// property: set:before jQuery.Event Object {x: (...), y: function} x 9
	 * 		// property: set jQuery.Event Object {x: (...), y: function} x 9
	 * 		// property: set:after jQuery.Event Object {x: (...), y: function} x 9
	 * 		// property: set:before jQuery.Event Object {x: (...), y: function} x 10
	 * 		// property: set jQuery.Event Object {x: (...), y: function} x 10
	 * 		// property: set:after jQuery.Event Object {x: (...), y: function} x 10
	 * 		// property: get:before jQuery.Event Object {x: (...), y: function} x
	 * 		// property: get jQuery.Event Object {x: (...), y: function} x 10
	 * 		// property: get:after jQuery.Event Object {x: (...), y: function} x 10
	 * 		// nuff undefined undefined undefined
	 * </code>
	 */
	var ObserverObjectProperty = function(object, property, options)
	{
		options = options || {};
		options.descriptor = Object.getOwnPropertyDescriptor(object, property);
		options.object = object;
		options.property = property;

		Base.call(this, options);

		this.observe();

		return this;
	};

	// prototyping
	ObserverObjectProperty.prototype = Object.create(Base.prototype,
	{
		/**
		 * @var {Object}
		 */
		descriptor:
		{
			value: undefined,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * property has an getter as value handler
		 * @var {Boolean}
		 */
		hasGetter:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return this.descriptor !== undefined && this.descriptor.get !== undefined;
			}
		},

		/**
		 * property has a setter as value handler
		 * @var {Boolean}
		 */
		hasSetter:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return this.descriptor !== undefined && this.descriptor.set !== undefined;
			}
		},

		/**
		 * property can be getted
		 *
		 * @var {Boolean}
		 */
		isGetable:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return this.hasGetter === true || this.isGetterSetterMode === false;
			}
		},

		/**
		 * property has an getter and a setter as value handler
		 * @var {Boolean}
		 */
		isGetterSetterMode:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return this.hasGetter === true || this.hasSetter === true;
			}
		},

		/**
		 * property can be setted
		 *
		 * @var {Boolean}
		 */
		isSetable:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				return this.hasSetter === true || this.isGetterSetterMode === false;
			}
		},

		/**
		 * @var {Object}
		 */
		object:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {String}
		 */
		property:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Boolean}
		 */
		started:
		{
			value: false,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Mixed}
		 */
		value:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * creates and returns a getter
	 *
	 * @returns {Function}
	 */
	ObserverObjectProperty.prototype.getGetter = function()
	{
		var self = this;

		// property has no getter... so no getter will be created
		if (this.isGetable === false)
		{
			return undefined;
		}

		// store value in observer if no getter but is getable
		if (this.hasGetter === false)
		{
			this.value = this.object[this.property];
		}

		// create getter
		return function()
		{
			var eventResult = self.trigger('get:before');

			var result = eventResult;
			if (eventResult === undefined)
			{
				// property has a getter use it
				if (self.hasGetter === true)
				{
					result = self.descriptor.get.apply(this, arguments);
				}
				// no getter was defined, get value from observer
				else
				{
					result = self.value;
				}
			}

			self.trigger('get', [result]);

			self.trigger('get:after', [result]);

			return result;
		};
	};

	/**
	 * creates and returns a function for function property
	 *
	 * @returns {Function}
	 */
	ObserverObjectProperty.prototype.getFunction = function()
	{
		var self = this;

		// create getter
		return function()
		{
			var parameters = Array.prototype.slice.call(arguments);
			var eventResult = self.trigger('get:before', parameters);

			var result = eventResult;
			if (eventResult === undefined)
			{
				result = self.descriptor.value.apply(this, arguments);
			}

			parameters.unshift(result);

			self.trigger('get', parameters);

			self.trigger('get:after', parameters);

			return result;
		};
	};

	/**
	 * creates and returns a setter
	 *
	 * @returns {Function}
	 */
	ObserverObjectProperty.prototype.getSetter = function()
	{
		var self = this;

		// property can not be setted... so no setter will be created
		if (this.isSetable === false)
		{
			return undefined;
		}

		// create the setter
		return function(newValue)
		{
			var oldValue = undefined;
			// property has a getter use it
			if (self.hasGetter === true)
			{
				oldValue = self.descriptor.get.apply(this);
			}
			// no getter was defined, get value from observer
			else
			{
				oldValue = self.value;
			}

			// trigger before
			var eventResult = self.trigger('set:before', [newValue, oldValue]);

			if (eventResult === false)
			{
				return;
			}

			// property has a setter use it
			if (self.hasSetter === true)
			{
				self.descriptor.set.apply(this, arguments);
			}
			// no setter was defined, store value on observer
			else
			{
				self.value = newValue;
			}

			self.trigger('set', [newValue, oldValue]);

			self.trigger('set:after', [newValue, oldValue]);
		};
	};

	/**
	 * observe the property
	 *
	 * @returns {ObserverObjectProperty}
	 */
	ObserverObjectProperty.prototype.observe = function()
	{
		this.started = true;

		// it is a function. observe function
		if (this.object[this.property] instanceof Function)
		{
			// define new property
			Object.defineProperty(this.object, this.property,
			{
				enumerable: this.descriptor !== undefined ? this.descriptor.enumerable : false,
				configurable: true,
				writable: true,
				value: this.getFunction()
			});
		}
		else
		{
			// define new property
			Object.defineProperty(this.object, this.property,
			{
				enumerable: this.descriptor !== undefined ? this.descriptor.enumerable : false,
				configurable: true,
				get: this.getGetter(),
				set: this.getSetter()
			});
		}

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
	ObserverObjectProperty.prototype.trigger = function(eventType, extraParameters)
	{
		// on not started no event trigger
		if (this.started === false)
		{
			return;
		}

		if (extraParameters !== undefined && extraParameters !== null)
		{
			extraParameters = Array.prototype.slice.call(extraParameters);
		}
		else
		{
			extraParameters = [];
		}

		extraParameters.unshift(this.property);
		extraParameters.unshift(this.object);

		return Base.prototype.trigger.call(this, eventType, extraParameters);
	};

	/**
	 * stops the observation
	 *
	 * @returns {ObserverObjectProperty}
	 */
	ObserverObjectProperty.prototype.unobserve = function()
	{
		// observation is stopped
		this.started = false;

		// save the value
		var value = undefined;

		// get the value if it is possible
		if (this.isGetable === true)
		{
			value = this.object[this.property];
		}

		// delete property deletes observer getter and setter
		delete this.object[this.property];

		// recreate property with complex descriptor
		// otherwise it will be recreate by simple setting of the property
		if (this.descriptor !== undefined)
		{
			Object.defineProperty(this.object, this.property, this.descriptor);
		}

		// set the value to the property back
		if (this.isSetable === true)
		{
			this.object[this.property] = value;
		}

		return this;
	};

	return ObserverObjectProperty;
});
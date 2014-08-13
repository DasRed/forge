'use strict';

define(
[
	'forge/object/base'
], function(
	Base
)
{
	/**
	 * object observer for all properties
	 *
	 * @param {Object} object
	 * @param {Object} options
	 * @returns {ObjectObserver}
	 *
	 * @event {void} get({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, value) fires if some whants to get the value
	 * @event {void} get[:PropertyName]({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, value) fires if some whants to get the value
	 * @event {mixed} get:before({jQuery.Event}, {ObjectOfObservation}, {PropertyName}) fires before if some wants to get the value. if callback returns a value other then undefined, this value will be retruned from get
	 * @event {mixed} get:before[:PropertyName]({jQuery.Event}, {ObjectOfObservation}, {PropertyName}) fires before if some wants to get the value. if callback returns a value other then undefined, this value will be retruned from get
	 * @event {void} get:after({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, value) fires after if some wants to get the value.
	 * @event {void} get:after[:PropertyName]({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, value) fires after if some wants to get the value.
	 *
	 * @event {void} set({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, newValue, oldValue) fires if some whants to set the value
	 * @event {void} set[:PropertyName]({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, newValue, oldValue) fires if some whants to set the value
	 * @event {boolean} set:before({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, newValue, oldValue) fires before if some wants to set the value. if callback returns FALSE the value will not be setted
	 * @event {boolean} set:before[:PropertyName]({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, newValue, oldValue) fires before if some wants to set the value. if callback returns FALSE the value will not be setted
	 * @event {void} set:after({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, newValue, oldValue) fires after if some wants to set the value.
	 * @event {void} set:after[:PropertyName]({jQuery.Event}, {ObjectOfObservation}, {PropertyName}, newValue, oldValue) fires after if some wants to set the value.
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
	 * 		var observer = new ObjectObserver(subject,
	 * 		{
	 * 			on:
	 * 			{
	 * 				'get': function(event, object, propertyName, value, a, b, c)
	 * 				{
	 * 					console.log('object: get', event, object, propertyName, value, a, b, c);
	 * 				},
	 * 				'get:x': function(event, object, propertyName, value)
	 * 				{
	 * 					console.log('object: get', event, object, propertyName, value);
	 * 				},
	 * 				'get:y': function(event, object, propertyName, value, a, b, c)
	 * 				{
	 * 					console.log('object: get', event, object, propertyName, value, a, b, c);
	 * 				},
	 * 				'get:before': function(event, object, propertyName, a, b, c)
	 * 				{
	 * 					console.log('object: get:before', event, object, propertyName, a, b, c);
	 * 				},
	 * 				'get:before:x': function(event, object, propertyName)
	 * 				{
	 * 					console.log('object: get:before', event, object, propertyName);
	 * 				},
	 * 				'get:before:y': function(event, object, propertyName, a, b, c)
	 * 				{
	 * 					console.log('object: get:before', event, object, propertyName, a, b, c);
	 * 				},
	 * 				'get:after': function(event, object, propertyName, value, a, b, c)
	 * 				{
	 * 					console.log('object: get:after', event, object, propertyName, value, a, b, c);
	 * 				},
	 * 				'get:after:x': function(event, object, propertyName, value)
	 * 				{
	 * 					console.log('object: get:after', event, object, propertyName, value);
	 * 				},
	 * 				'get:after:y': function(event, object, propertyName, value, a, b, c)
	 * 				{
	 * 					console.log('object: get:after', event, object, propertyName, value, a, b, c);
	 * 				},
	 * 				'set': function(event, object, propertyName, newValue)
	 * 				{
	 * 					console.log('object: set', event, object, propertyName, newValue);
	 * 				},
	 * 				'set:x': function(event, object, propertyName, newValue)
	 * 				{
	 * 					console.log('object: set', event, object, propertyName, newValue);
	 * 				},
	 * 				'set:before': function(event, object, propertyName, newValue)
	 * 				{
	 * 					console.log('object: set:before', event, object, propertyName, newValue);
	 * 				},
	 * 				'set:before:x': function(event, object, propertyName, newValue)
	 * 				{
	 * 					console.log('object: set:before', event, object, propertyName, newValue);
	 * 				},
	 * 				'set:after': function(event, object, propertyName, newValue)
	 * 				{
	 * 					console.log('object: set:after', event, object, propertyName, newValue);
	 * 				},
	 * 				'set:after:x': function(event, object, propertyName, newValue)
	 * 				{
	 * 					console.log('object: set:after', event, object, propertyName, newValue);
	 * 				}
	 * 			}
	 * 		});
	 *
	 * 		subject.x = 10;
	 * 		var x = subject.x;
	 * 		subject.y('a', 'b', 'c');
	 *
	 * 		observer.unobserve();
	 * 		subject.x = 51;
	 *
	 * 		// outputs on console
	 * 		//
	 * 		// object: set:before jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: set:before jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: set jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: set jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: set:after jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: set:after jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: get:before jQuery.Event Object {x: (...), y: function} x
	 * 		// object: get:before jQuery.Event Object {x: (...), y: function} x undefined undefined undefined
	 * 		// object: get jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: get jQuery.Event Object {x: (...), y: function} x 10 undefined undefined undefined
	 * 		// object: get:after jQuery.Event Object {x: (...), y: function} x 10
	 * 		// object: get:after jQuery.Event Object {x: (...), y: function} x 10 undefined undefined undefined
	 * 		// object: get:before jQuery.Event Object {x: (...), y: function} y a b c
	 * 		// object: get:before jQuery.Event Object {x: (...), y: function} y a b c
	 * 		// nuff a b c
	 * 		// object: get jQuery.Event Object {x: (...), y: function} y undefined a b c
	 * 		// object: get jQuery.Event Object {x: (...), y: function} y undefined a b c
	 * 		// object: get:after jQuery.Event Object {x: (...), y: function} y undefined a b c
	 * 		// object: get:after jQuery.Event Object {x: (...), y: function} y undefined a b c
	 * </code>
	 */
	var ObjectObserver = function(object, options)
	{
		this.observers = {};
		this.object = object;

		Base.call(this, options);

		this.initialize();

		if (this.autoObserver === true)
		{
			this.observe();
		}

		return this;
	};

	// prototyping
	ObjectObserver.prototype = Object.create(Base.prototype,
	{
		/**
		 * @var {Boolean}
		 */
		autoObserver:
		{
			value: true,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Object}
		 */
		observers:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
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
		 * properties to observe
		 *
		 * @var {Object}
		 */
		properties:
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
		}
	});

	/**
	 * creates property informations
	 *
	 * @param {String} propertyName
	 * @returns {Object}
	 */
	ObjectObserver.prototype.createPropertyInformation = function(propertyName)
	{
		var property = {};

		property.name = propertyName;

		// descriptor informations of property
		property.descriptor = Object.getOwnPropertyDescriptor(this.object, propertyName);

		// property has an getter as value handler
		property.hasGetter = property.descriptor !== undefined && property.descriptor.get !== undefined;

		// property has a setter as value handler
		property.hasSetter = property.descriptor !== undefined && property.descriptor.set !== undefined;

		// property has an getter and a setter as value handler
		property.isGetterSetterMode = property.hasGetter === true || property.hasSetter === true;
		// property can be getted
		property.isGetable = property.hasGetter === true || property.isGetterSetterMode === false;
		// property can be setted
		property.isSetable = property.hasSetter === true || property.isGetterSetterMode === false;

		// property is a function
		property.isFunction = this.object[propertyName] instanceof Function;

		// property is Enumerable
		property.isEnumerable = property.descriptor !== undefined ? property.descriptor.enumerable : false;

		// init value for property
		property.value = undefined;

		// store value in observer if no getter but is getable
		if (property.hasGetter === false)
		{
			property.value = this.object[property.name];
		}

		return property;
	};


	/**
	 * creates and returns a getter for a property
	 *
	 * @param {Object} property
	 * @returns {Function}
	 */
	ObjectObserver.prototype.getGetter = function(property)
	{
		var self = this;

		// create getter
		return function()
		{
			var result = self.trigger('get:before:' + property.name, property);

			// result from event "get:before::PROPERTY" overrules result from event "get:before"
			if (result === undefined)
			{
				result = self.trigger('get:before', property);
			}

			// a result was found, do not take it from original
			if (result === undefined)
			{
				// property has a getter use it
				if (property.hasGetter === true)
				{
					result = property.descriptor.get.apply(this, arguments);
				}
				// no getter was defined, get value from observer
				else
				{
					result = property.value;
				}
			}

			self.trigger('get:' + property.name, property, [result]);
			self.trigger('get', property, [result]);

			self.trigger('get:after:' + property.name, property, [result]);
			self.trigger('get:after', property, [result]);

			return result;
		};
	};

	/**
	 * creates and returns a function for function property
	 *
	 * @param {Object} property
	 * @returns {Function}
	 */
	ObjectObserver.prototype.getFunction = function(property)
	{
		var self = this;

		// create getter
		return function()
		{
			var parameters = Array.prototype.slice.call(arguments);

			var result = self.trigger('get:before:' + property.name, property, parameters);

			// result from event "get:before::PROPERTY" overrules result from event "get:before"
			if (result === undefined)
			{
				result = self.trigger('get:before', property, parameters);
			}

			// a result was found, do not take it from original
			if (result === undefined)
			{
				result = property.descriptor.value.apply(this, arguments);
			}

			parameters.unshift(result);

			self.trigger('get:' + property.name, property, parameters);
			self.trigger('get', property, parameters);

			self.trigger('get:after:' + property.name, property, parameters);
			self.trigger('get:after', property, parameters);

			return result;
		};
	};

	/**
	 * creates and returns a setter
	 *
	 * @param {Object} property
	 * @returns {Function}
	 */
	ObjectObserver.prototype.getSetter = function(property)
	{
		var self = this;

		// create the setter
		return function(newValue)
		{
			var oldValue = undefined;
			// property has a getter use it
			if (property.hasGetter === true)
			{
				oldValue = property.descriptor.get.apply(this);
			}
			// no getter was defined, get value from observer
			else
			{
				oldValue = property.value;
			}

			// trigger before with Property
			var eventResultProperty = self.trigger('set:before:' + property.name, property, [newValue, oldValue]);
			if (eventResultProperty === false)
			{
				return;
			}

			// trigger before
			var eventResult = self.trigger('set:before', property, [newValue, oldValue]);
			if (eventResult === false)
			{
				return;
			}

			// property has a setter use it
			if (property.hasSetter === true)
			{
				property.descriptor.set.apply(this, arguments);
			}
			// no setter was defined, store value on observer
			else
			{
				property.value = newValue;
			}

			self.trigger('set:' + property.name, property, [newValue, oldValue]);
			self.trigger('set', property, [newValue, oldValue]);

			self.trigger('set:after:' + property.name, property, [newValue, oldValue]);
			self.trigger('set:after', property, [newValue, oldValue]);
		};
	};

	/**
	 * initialize
	 *
	 * @returns {ObjectObserver}
	 */
	ObjectObserver.prototype.initialize = function()
	{
		// convert to Object
		if (this.properties instanceof Array)
		{
			var properties = this.properties;
			this.properties = {};
			for (var i = 0; i < properties.length; i++)
			{
				this.properties[properties[i]] = this.createPropertyInformation(properties[i]);
			}
		}
		// properties are not an object, create full object observe
		else if ((this.properties instanceof Object) === false)
		{
			this.properties = {};
			for (var propertyName in this.object)
			{
				this.properties[propertyName] = this.createPropertyInformation(propertyName);
			}
		}
		// it is an object, create only the informations
		else
		{
			for (var propertyName in this.properties)
			{
				this.properties[propertyName] = this.createPropertyInformation(propertyName);
			}
		}

		return this;
	};

	/**
	 * observe the object
	 *
	 * @returns {ObjectObserver}
	 */
	ObjectObserver.prototype.observe = function()
	{
		this.started = true;

		for (var propertyName in this.properties)
		{
			var property = this.properties[propertyName];

			// it is a function. observe function
			if (property.isFunction === true)
			{
				// define new property
				Object.defineProperty(this.object, propertyName,
				{
					enumerable: property.isEnumerable,
					configurable: true,
					writable: true,
					value: this.getFunction(property)
				});
			}
			// property is a not function. just a simple value
			else
			{
				// define new property
				Object.defineProperty(this.object, propertyName,
				{
					enumerable: property.isEnumerable,
					configurable: true,
					get: property.isGetable === true ? this.getGetter(property) : undefined,
					set: property.isSetable === true ? this.getSetter(property) : undefined
				});
			}
		}

		return this;
	};

	/**
	 * trigger
	 *
	 * @see http://api.jquery.com/trigger/
	 * @param {String} eventType
	 * @param {Object} property
	 * @param {Array} parameters
	 * @returns {Mixed}
	 */
	ObjectObserver.prototype.trigger = function(eventType, property, parameters)
	{
		// on not started no event trigger
		if (this.started === false)
		{
			return;
		}

		// clone parameters to prevent injection of other values
		if (parameters instanceof Array)
		{
			parameters = Array.prototype.slice.call(parameters);
		}
		// empty parameters
		else
		{
			parameters = [];
		}

		parameters.unshift(property.name);
		parameters.unshift(this.object);

		return Base.prototype.trigger.call(this, eventType, parameters);
	};

	/**
	 * unobserve the object
	 *
	 * @returns {ObjectObserver}
	 */
	ObjectObserver.prototype.unobserve = function()
	{
		this.started = false;

		for (var propertyName in this.properties)
		{
			var property = this.properties[propertyName];

			// save the value
			var value = undefined;

			// get the value if it is possible
			if (property.isGetable === true)
			{
				value = this.object[property.name];
			}

			// delete property deletes observer getter and setter
			delete this.object[property.name];

			// recreate property with complex descriptor
			// otherwise it will be recreate by simple setting of the property
			if (property.descriptor !== undefined)
			{
				Object.defineProperty(this.object, property.name, property.descriptor);
			}

			// set the value to the property back
			if (property.isSetable === true)
			{
				this.object[property.name] = value;
			}
		}

		return this;
	};

	return ObjectObserver;
});
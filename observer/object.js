'use strict';

define(
[
	'forge/object/base',
	'forge/observer/object/property'
], function(
	Base,
	ObserverObjectProperty
)
{
	/**
	 * object observer for all properties
	 *
	 * @param {Object} object
	 * @param {Object} options
	 * @returns {ObserverObject}
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
	 * 		var observer = new ObserverObject(subject,
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
	var ObserverObject = function(object, options)
	{
		this.observers = {};
		this.object = object;

		Base.call(this, options);

		this.observe();

		return this;
	};

	// prototyping
	ObserverObject.prototype = Object.create(Base.prototype,
	{
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
			enumerable: false,
			configurable: false,
			get: function()
			{
				// no property is defined. use all properties and observe
				if (this._properties === undefined)
				{
					this._properties = {};
					for (var propertyName in this.object)
					{
						this._properties[propertyName] = true;
					}
				}

				return this._properties;
			},
			set: function(properties)
			{
				if (this._properties !== undefined)
				{
					this.unobserve();
				}

				this._properties = properties;

				// convert to Object
				if (properties instanceof Array)
				{
					this._properties = {};
					for (var i = 0; i < properties.length; i++)
					{
						this._properties[properties[i]] = true;
					}
				}
			}
		}
	});

	/**
	 * observe the object
	 *
	 * @returns {ObserverObject}
	 */
	ObserverObject.prototype.observe = function()
	{
		this.unobserve();

		var fnOnObserver = this.onObserver.bind(this);

		for (var propertyName in this.properties)
		{
			this.observers[propertyName] = new ObserverObjectProperty(this.object, propertyName,
			{
				on:
				{
					'get': fnOnObserver,
					'get:before': fnOnObserver,
					'get:after': fnOnObserver,
					'set': fnOnObserver,
					'set:before': fnOnObserver,
					'set:after': fnOnObserver
				}
			});
		}

		return this;
	};

	/**
	 * onObserver events
	 *
	 * @param {jQuery.Event} event
	 * @param {Object} object
	 * @param {String} propertyName
	 * @param {Mixed} ...
	 * @returns {Mixed}
	 */
	ObserverObject.prototype.onObserver = function(event, object, propertyName)
	{
		var result = undefined;
		var parameters = Array.prototype.slice.call(arguments);

		// remove the event from parameters
		parameters.shift();

		// first fire the event for the property
		result = this.trigger(event.type + ':' + propertyName, parameters);

		// before events can return values. all other values are ignored
		// if a value was return. then return this value
		if (event.type.substr(-7) !== ':before' || result === undefined)
		{
			// now fire the generall event
			result = this.trigger(event.type, parameters);
		}

		return result;
	};

	/**
	 * unobserve the object
	 *
	 * @returns {ObserverObject}
	 */
	ObserverObject.prototype.unobserve = function()
	{
		for (var propertyName in this.observers)
		{
			this.observers[propertyName].unobserve();
			delete this.observers[propertyName];
		}

		return this;
	};

	return ObserverObject;
});
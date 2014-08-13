'use strict';

define(
[
	'forge/object/observer'
], function(
	ObjectObserver
)
{
	/**
	 * property observer
	 *
	 * @param {Object} object
	 * @param {String} property
	 * @param {Object} options
	 * @returns {ObjectObserverProperty}
	 *
	 * @event {void} get({ObjectOfObservedProperty}, {PropertyName}, value [, PARAMETERS]) fires if some whants to get the value
	 * @event {mixed} get:before({ObjectOfObservedProperty}, {PropertyName} [, PARAMETERS]) fires before if some wants to get the value. if callback returns a value other then undefined, this value will be retruned from get
	 * @event {void} get:after({ObjectOfObservedProperty}, {PropertyName}, value [, PARAMETERS]) fires after if some wants to get the value.
	 *
	 * @event {void} set({ObjectOfObservedProperty}, {PropertyName}, newValue, oldValue) fires if some whants to set the value
	 * @event {boolean} set:before({ObjectOfObservedProperty}, {PropertyName}, newValue, oldValue) fires before if some wants to set the value. if callback returns FALSE the value will not be setted
	 * @event {void} set:after({ObjectOfObservedProperty}, {PropertyName}, newValue, oldValue) fires after if some wants to set the value.
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
	 * 		var observer = new ObjectObserverProperty(subject, 'x',
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
	 * 		// property: set:before Object {x: (...), y: function} x 9
	 * 		// property: set Object {x: (...), y: function} x 9
	 * 		// property: set:after Object {x: (...), y: function} x 9
	 * 		// property: set:before Object {x: (...), y: function} x 10
	 * 		// property: set Object {x: (...), y: function} x 10
	 * 		// property: set:after Object {x: (...), y: function} x 10
	 * 		// property: get:before Object {x: (...), y: function} x
	 * 		// property: get Object {x: (...), y: function} x 10
	 * 		// property: get:after Object {x: (...), y: function} x 10
	 * 		// nuff undefined undefined undefined
	 * </code>
	 */
	var ObjectObserverProperty = function(object, property, options)
	{
		options = options || {};
		options.properties = {};
		options.properties[property] = true;

		ObjectObserver.call(this, object, options);

		return this;
	};

	// prototyping
	ObjectObserverProperty.prototype = Object.create(ObjectObserver.prototype);

	return ObjectObserverProperty;
});
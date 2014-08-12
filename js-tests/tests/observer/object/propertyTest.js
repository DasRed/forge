'use strict';

require(
[
	'forge/observer/object/property'
], function(
	ObserverObjectProperty
)
{
	describe('forge/observer/object/property', function()
	{
		var object = null;
		var observer = null;
		var callbackPropertY = null;
		var callbackPropertY2 = null;

		beforeEach(function()
		{
			callbackPropertY = jasmine.createSpy().and.returnValue('y:12a');
			callbackPropertY2 = jasmine.createSpy().and.returnValue('y2:34b');

			object  =
			{
				x: 10,
				x2: 20,
				y: callbackPropertY,
				y2: callbackPropertY2
			};
		});

		afterEach(function()
		{
			callbackPropertY = null;
			callbackPropertY2 = null;

			observer.unobserve();
			observer = null;
			object = null;
		});

		it('should only observe property "x" and not property "x2"', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'get:before': callback,
					'get': callback,
					'get:after': callback,
					'set:before': callback,
					'set': callback,
					'set:after': callback
				}
			});

			var result = object.x;
			object.x = 12;

			var result2 = object.x2;
			object.x2 = 22;

			expect(callback).toHaveBeenCalled();
			expect(callback.calls.count()).toBe(6);

			expect(result).toBe(10);
			expect(object.x).toBe(12);

			expect(result2).toBe(20);
			expect(object.x2).toBe(22);
		});

		it('should trigger event "get:before" for property "x" and return the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'get:before': callback
				}
			});

			var result = object.x;

			expect(result).toBe(10);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callback.calls.count()).toBe(1);
		});

		it('should return the callback result for the event "get:before" for property "x"', function()
		{
			var callback = jasmine.createSpy().and.returnValue(11);

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'get:before': callback
				}
			});

			var result = object.x;

			expect(result).toBe(11);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callback.calls.count()).toBe(1);
		});

		it('should trigger event "get" for property "x" and return the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'get': callback
				}
			});

			var result = object.x;

			expect(result).toBe(10);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callback.calls.count()).toBe(1);
		});

		it('should trigger event "get:after" for property "x" and return the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'get:after': callback
				}
			});

			var result = object.x;

			expect(result).toBe(10);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callback.calls.count()).toBe(1);
		});

		it('should trigger event "set:before" for property "x" and set the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'set:before': callback
				}
			});

			object.x = 12;

			expect(object.x).toBe(12);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callback.calls.count()).toBe(1);
		});

		it('should reject the new value by calling the callback for the event "set:before" for property "x"', function()
		{
			var callbackSetBefore = jasmine.createSpy().and.returnValue(false);
			var callbackSet = jasmine.createSpy();
			var callbackSetAfter = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'set:before': callbackSetBefore,
					'set': callbackSet,
					'set:after': callbackSetAfter
				}
			});

			object.x = 12;

			expect(object.x).toBe(10);
			expect(callbackSetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBefore.calls.count()).toBe(1);
			expect(callbackSet).not.toHaveBeenCalled();
			expect(callbackSet.calls.count()).toBe(0);
			expect(callbackSetAfter).not.toHaveBeenCalled();
			expect(callbackSetAfter.calls.count()).toBe(0);
		});

		it('should trigger event "set" for property "x" and set the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'set': callback
				}
			});

			object.x = 12;

			expect(object.x).toBe(12);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callback.calls.count()).toBe(1);
		});

		it('should trigger event "set:after" for property "x" and set the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'x',
			{
				on:
				{
					'set:after': callback
				}
			});

			object.x = 12;

			expect(object.x).toBe(12);
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callback.calls.count()).toBe(1);
		});

		it('should only observe property function "y" and not property "y2"', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'get:before': callback,
					'get': callback,
					'get:after': callback,
					'set:before': callback,
					'set': callback,
					'set:after': callback
				}
			});

			var result = object.y(1, 2, 'a');
			var result2 = object.y2(3, 4, 'b');

			expect(callback).toHaveBeenCalled();
			expect(callback.calls.count()).toBe(3);

			expect(result).toBe('y:12a');
			expect(result2).toBe('y2:34b');
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
			expect(callbackPropertY2).toHaveBeenCalledWith(3, 4, 'b');
			expect(callbackPropertY2.calls.count()).toBe(1);
		});

		it('should trigger event "get:before" for property function "y" and return the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'get:before': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('y:12a');
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callback.calls.count()).toBe(1);
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should return the callback result for the event "get:before" for property function "y"', function()
		{
			var callback = jasmine.createSpy().and.returnValue('a:98z');

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'get:before': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('a:98z');
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callback.calls.count()).toBe(1);
			expect(callbackPropertY).not.toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(0);
		});

		it('should trigger event "get" for property function "y" and return the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'get': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('y:12a');
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callback.calls.count()).toBe(1);
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should trigger event "get:after" for property function "y" and return the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'get:after': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('y:12a');
			expect(callback).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callback.calls.count()).toBe(1);
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should never trigger event "set:before" for property function "y"', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'set:before': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('y:12a');
			expect(callback).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callback.calls.count()).toBe(0);
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should never trigger event "set" for property function "y" and set the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'set': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('y:12a');
			expect(callback).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callback.calls.count()).toBe(0);
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should trigger event "set:after" for property function "y" and set the value', function()
		{
			var callback = jasmine.createSpy();

			observer = new ObserverObjectProperty(object, 'y',
			{
				on:
				{
					'set:after': callback
				}
			});

			var result = object.y(1, 2, 'a');

			expect(result).toBe('y:12a');
			expect(callback).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callback.calls.count()).toBe(0);
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});
	});
});
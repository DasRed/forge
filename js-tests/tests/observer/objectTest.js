'use strict';

require(
[
	'forge/observer/object'
], function(
	ObserverObject
)
{
	describe('forge/observer/object', function()
	{
		var object = null;
		var observer = null;
		var callbackPropertY = null;

		var callbackGetBeforeX = null;
		var callbackGetBeforeY = null;
		var callbackGetBefore = null;
		var callbackGetX = null;
		var callbackGetY = null;
		var callbackGet = null;
		var callbackGetAfterX = null;
		var callbackGetAfterY = null;
		var callbackGetAfter = null;

		var callbackSetBeforeX = null;
		var callbackSetBeforeY = null;
		var callbackSetBefore = null;
		var callbackSetX = null;
		var callbackSetY = null;
		var callbackSet = null;
		var callbackSetAfterX = null;
		var callbackSetAfterY = null;
		var callbackSetAfter = null;

		beforeEach(function()
		{
			callbackPropertY = jasmine.createSpy().and.returnValue('y:12a');

			callbackGetBeforeX = jasmine.createSpy();
			callbackGetBeforeY = jasmine.createSpy();
			callbackGetBefore = jasmine.createSpy();
			callbackGetX = jasmine.createSpy();
			callbackGetY = jasmine.createSpy();
			callbackGet = jasmine.createSpy();
			callbackGetAfterX = jasmine.createSpy();
			callbackGetAfterY = jasmine.createSpy();
			callbackGetAfter = jasmine.createSpy();

			callbackSetBeforeX = jasmine.createSpy();
			callbackSetBeforeY = jasmine.createSpy();
			callbackSetBefore = jasmine.createSpy();
			callbackSetX = jasmine.createSpy();
			callbackSetY = jasmine.createSpy();
			callbackSet = jasmine.createSpy();
			callbackSetAfterX = jasmine.createSpy();
			callbackSetAfterY = jasmine.createSpy();
			callbackSetAfter = jasmine.createSpy();

			object  =
			{
				x: 10,
				y: callbackPropertY
			};

			observer = new ObserverObject(object,
			{
				on:
				{
					'get:before:x': callbackGetBeforeX,
					'get:before:y': callbackGetBeforeY,
					'get:before': callbackGetBefore,
					'get:x': callbackGetX,
					'get:y': callbackGetY,
					'get': callbackGet,
					'get:after:x': callbackGetAfterX,
					'get:after:y': callbackGetAfterY,
					'get:after': callbackGetAfter,

					'set:before:x': callbackSetBeforeX,
					'set:before:y': callbackSetBeforeY,
					'set:before': callbackSetBefore,
					'set:x': callbackSetX,
					'set:y': callbackSetY,
					'set': callbackSet,
					'set:after:x': callbackSetAfterX,
					'set:after:y': callbackSetAfterY,
					'set:after': callbackSetAfter
				}
			});
		});

		afterEach(function()
		{
			callbackPropertY = null;

			callbackGetBeforeX = null;
			callbackGetBeforeY = null;
			callbackGetBefore = null;
			callbackGetX = null;
			callbackGetY = null;
			callbackGet = null;
			callbackGetAfterX = null;
			callbackGetAfterY = null;
			callbackGetAfter = null;

			callbackSetBeforeX = null;
			callbackSetBeforeY = null;
			callbackSetBefore = null;
			callbackSetX = null;
			callbackSetY = null;
			callbackSet = null;
			callbackSetAfterX = null;
			callbackSetAfterY = null;
			callbackSetAfter = null;

			observer.unobserve();
			observer = null;
			object = null;
		});

		it('should observe property "x" and property function "y"', function()
		{
			var result = object.x;
			object.x = 12;

			var result2 = object.y(1, 2, 'a');

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(result).toBe(10);
			expect(object.x).toBe(12);
			expect(result2).toBe('y:12a');
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should return the callback result for the event "get:before:*" and overwrite result "get:before"', function()
		{
			callbackGetBeforeX.and.returnValue(11);
			callbackGetBeforeY.and.returnValue('a:98z');

			var result = object.x;
			object.x = 12;
			var result2 = object.y(1, 2, 'a');

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(0);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 11);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 11);
			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 11);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 11);
			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(result).toBe(11);
			expect(result2).toBe('a:98z');
			expect(callbackPropertY).not.toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(0);
		});

		it('should return the callback result for the event "get:before"', function()
		{
			callbackGetBefore.and.returnValue('11 + a:98z');

			var result = object.x;
			object.x = 12;

			var result2 = object.y(1, 2, 'a');

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', '11 + a:98z');
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', '11 + a:98z');
			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', '11 + a:98z');
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', '11 + a:98z');
			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(result).toBe('11 + a:98z');
			expect(result2).toBe('11 + a:98z');
			expect(callbackPropertY).not.toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(0);
		});

		it('should reject the new value by calling the callback for the event "set:before:*" and overwrite result "set:before"', function()
		{
			callbackSetBeforeX.and.returnValue(false);
			callbackSetBeforeY.and.returnValue(false);

			var result = object.x;
			object.x = 12;

			var result2 = object.y(1, 2, 'a');

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(0);

			// SET
			expect(callbackSetX).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(0);

			expect(callbackSetY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(0);

			// SET After
			expect(callbackSetAfterX).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(0);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfter.calls.count()).toBe(0);

			// values
			expect(result).toBe(10);
			expect(object.x).toBe(10);
			expect(result2).toBe('y:12a');
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should reject the new value by calling the callback for the event "set:before"', function()
		{
			callbackSetBefore.and.returnValue(false);

			var result = object.x;
			object.x = 12;

			var result2 = object.y(1, 2, 'a');

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 10);
			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(0);

			expect(callbackSetY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(0);

			// SET After
			expect(callbackSetAfterX).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(0);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfter.calls.count()).toBe(0);

			// values
			expect(result).toBe(10);
			expect(object.x).toBe(10);
			expect(result2).toBe('y:12a');
			expect(callbackPropertY).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackPropertY.calls.count()).toBe(1);
		});

		it('should observe property "x" and not property function "y"', function()
		{
			var objectLocal  =
			{
				x: 10,
				y: 'y:12a'
			};

			var observerLocal = new ObserverObject(objectLocal,
			{
				properties:
				{
					x: true
				},
				on:
				{
					'get:before:x': callbackGetBeforeX,
					'get:before:y': callbackGetBeforeY,
					'get:before': callbackGetBefore,
					'get:x': callbackGetX,
					'get:y': callbackGetY,
					'get': callbackGet,
					'get:after:x': callbackGetAfterX,
					'get:after:y': callbackGetAfterY,
					'get:after': callbackGetAfter,

					'set:before:x': callbackSetBeforeX,
					'set:before:y': callbackSetBeforeY,
					'set:before': callbackSetBefore,
					'set:x': callbackSetX,
					'set:y': callbackSetY,
					'set': callbackSet,
					'set:after:x': callbackSetAfterX,
					'set:after:y': callbackSetAfterY,
					'set:after': callbackSetAfter
				}
			});

			var resultX = objectLocal.x;
			objectLocal.x = 12;

			var resultY = objectLocal.y;
			objectLocal.y = 'a:98z';

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y');
			expect(callbackGetBeforeY.calls.count()).toBe(0);

			expect(callbackGetBefore).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y');
			expect(callbackGetBefore.calls.count()).toBe(1);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'y:12a');
			expect(callbackGetY.calls.count()).toBe(0);

			expect(callbackGet).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 10);
			expect(callbackGet).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'y:12a');
			expect(callbackGet.calls.count()).toBe(1);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'y:12a');
			expect(callbackGetAfterY.calls.count()).toBe(0);

			expect(callbackGetAfter).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 10);
			expect(callbackGetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'y:12a');
			expect(callbackGetAfter.calls.count()).toBe(1);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(jasmine.any(Object), objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(resultX).toBe(10);
			expect(objectLocal.x).toBe(12);
			expect(resultY).toBe('y:12a');
			expect(objectLocal.y).toBe('a:98z');

			observerLocal.unobserve();
		});
	});
});
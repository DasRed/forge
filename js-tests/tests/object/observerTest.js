'use strict';

require(
[
	'forge/object/observer'
], function(
	ObjectObserver
)
{
	describe('forge/object/observer', function()
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
			callbackPropertY = jasmine.createSpy('callbackPropertY').and.returnValue('y:12a');

			callbackGetBeforeX = jasmine.createSpy('callbackGetBeforeX');
			callbackGetBeforeY = jasmine.createSpy('callbackGetBeforeY');
			callbackGetBefore = jasmine.createSpy('callbackGetBefore');
			callbackGetX = jasmine.createSpy('callbackGetX');
			callbackGetY = jasmine.createSpy('callbackGetY');
			callbackGet = jasmine.createSpy('callbackGet');
			callbackGetAfterX = jasmine.createSpy('callbackGetAfterX');
			callbackGetAfterY = jasmine.createSpy('callbackGetAfterY');
			callbackGetAfter = jasmine.createSpy('callbackGetAfter');

			callbackSetBeforeX = jasmine.createSpy('callbackSetBeforeX');
			callbackSetBeforeY = jasmine.createSpy('callbackSetBeforeY');
			callbackSetBefore = jasmine.createSpy('callbackSetBefore');
			callbackSetX = jasmine.createSpy('callbackSetX');
			callbackSetY = jasmine.createSpy('callbackSetY');
			callbackSet = jasmine.createSpy('callbackSet');
			callbackSetAfterX = jasmine.createSpy('callbackSetAfterX');
			callbackSetAfterY = jasmine.createSpy('callbackSetAfterY');
			callbackSetAfter = jasmine.createSpy('callbackSetAfter');

			object  =
			{
				x: 10,
				y: callbackPropertY
			};

			observer = new ObjectObserver(object,
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGet).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).not.toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(0);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(object, 'x', 11);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(object, 'x', 11);
			expect(callbackGet).toHaveBeenCalledWith(object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(object, 'x', 11);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'x', 11);
			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'y', 'a:98z', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(object, 'x', '11 + a:98z');
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(object, 'x', '11 + a:98z');
			expect(callbackGet).toHaveBeenCalledWith(object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(object, 'x', '11 + a:98z');
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'x', '11 + a:98z');
			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'y', '11 + a:98z', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGet).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(0);

			// SET
			expect(callbackSetX).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(0);

			expect(callbackSetY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(0);

			// SET After
			expect(callbackSetAfterX).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(0);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBeforeY.calls.count()).toBe(1);

			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'x');
			expect(callbackGetBefore).toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackGetBefore.calls.count()).toBe(2);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetY.calls.count()).toBe(1);

			expect(callbackGet).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGet).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGet.calls.count()).toBe(2);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfterY.calls.count()).toBe(1);

			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'x', 10);
			expect(callbackGetAfter).toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackGetAfter.calls.count()).toBe(2);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(object, 'y', 1, 2, 'a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(0);

			expect(callbackSetY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSet.calls.count()).toBe(0);

			// SET After
			expect(callbackSetAfterX).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(0);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(object, 'y', 'y:12a', 1, 2, 'a');
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
			var objectLocal =
			{
				x: 10,
				y: 'y:12a'
			};

			var observerLocal = new ObjectObserver(objectLocal,
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBeforeY.calls.count()).toBe(0);

			expect(callbackGetBefore).toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBefore.calls.count()).toBe(1);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetY.calls.count()).toBe(0);

			expect(callbackGet).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGet).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGet.calls.count()).toBe(1);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfterY.calls.count()).toBe(0);

			expect(callbackGetAfter).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfter.calls.count()).toBe(1);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(resultX).toBe(10);
			expect(objectLocal.x).toBe(12);
			expect(resultY).toBe('y:12a');
			expect(objectLocal.y).toBe('a:98z');

			observerLocal.unobserve();
		});

		it('should observe property "x" and not property "y" with getter and setter', function()
		{
			var objectLocal = Object.create(Object,
			{
				x:
				{
					enumerable: true,
					configurable: true,
					get: function()
					{
						if (this._x === undefined)
						{
							return 10;
						}

						return this._x;
					},
					set: function(x)
					{
						this._x = x;
					}
				},
				y:
				{
					enumerable: false,
					configurable: false,
					get: function()
					{
						if (this._y === undefined)
						{
							return 'y:12a';
						}

						return this._y;
					},
					set: function(y)
					{
						this._y = y;
					}
				}
			});

			var observerLocal = new ObjectObserver(objectLocal,
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
			expect(callbackGetBeforeX).toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBeforeY.calls.count()).toBe(0);

			expect(callbackGetBefore).toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBefore.calls.count()).toBe(1);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetY.calls.count()).toBe(0);

			expect(callbackGet).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGet).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGet.calls.count()).toBe(1);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfterY.calls.count()).toBe(0);

			expect(callbackGetAfter).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfter.calls.count()).toBe(1);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(resultX).toBe(10);
			expect(objectLocal.x).toBe(12);
			expect(objectLocal._x).toBe(12);
			expect(resultY).toBe('y:12a');
			expect(objectLocal.y).toBe('a:98z');
			expect(objectLocal._y).toBe('a:98z');

			observerLocal.unobserve();
		});

		it('should observe property "x" and not property "y" with getter and no setter', function()
		{
			var objectLocal = Object.create(Object,
			{
				x:
				{
					enumerable: true,
					configurable: true,
					get: function()
					{
						if (this._x === undefined)
						{
							return 10;
						}

						return this._x;
					}
				},
				y:
				{
					enumerable: false,
					configurable: false,
					get: function()
					{
						if (this._y === undefined)
						{
							return 'y:12a';
						}

						return this._y;
					}
				}
			});

			var observerLocal = new ObjectObserver(objectLocal,
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
			try
			{
				objectLocal.x = 12;
			}
			catch (exception)
			{

			}

			var resultY = objectLocal.y;
			try
			{
				objectLocal.y = 'a:98z';
			}
			catch (exception)
			{

			}

			// GET Before
			expect(callbackGetBeforeX).toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(1);

			expect(callbackGetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBeforeY.calls.count()).toBe(0);

			expect(callbackGetBefore).toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBefore.calls.count()).toBe(1);

			// GET
			expect(callbackGetX).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(1);

			expect(callbackGetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetY.calls.count()).toBe(0);

			expect(callbackGet).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGet).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGet.calls.count()).toBe(1);

			// GET After
			expect(callbackGetAfterX).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(1);

			expect(callbackGetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfterY.calls.count()).toBe(0);

			expect(callbackGetAfter).toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfter.calls.count()).toBe(1);

			// SET Before
			expect(callbackSetBeforeX).not.toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetBeforeX.calls.count()).toBe(0);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).not.toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetBefore.calls.count()).toBe(0);

			// SET
			expect(callbackSetX).not.toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetX.calls.count()).toBe(0);

			expect(callbackSetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).not.toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSet).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSet.calls.count()).toBe(0);

			// SET After
			expect(callbackSetAfterX).not.toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetAfterX.calls.count()).toBe(0);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).not.toHaveBeenCalledWith(objectLocal, 'x', 12, 10);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', 'y:12a');
			expect(callbackSetAfter.calls.count()).toBe(0);

			// values
			expect(resultX).toBe(10);
			expect(objectLocal.x).toBe(10);
			expect(objectLocal._x).toBeUndefined();
			expect(resultY).toBe('y:12a');
			expect(objectLocal.y).toBe('y:12a');
			expect(objectLocal._y).toBeUndefined();

			observerLocal.unobserve();
		});

		it('should observe property "x" and not property "y" with no getter but a setter', function()
		{
			var objectLocal = Object.create(Object,
			{
				x:
				{
					enumerable: true,
					configurable: true,
					set: function(x)
					{
						this._x = x;
					}
				},
				y:
				{
					enumerable: false,
					configurable: false,
					set: function(y)
					{
						this._y = y;
					}
				}
			});

			var observerLocal = new ObjectObserver(objectLocal,
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

			var resultX = undefined;
			try
			{
				resultX = objectLocal.x;
			}
			catch (exception)
			{

			}
			objectLocal.x = 12;

			var resultY = undefined;
			try
			{
				resultY = objectLocal.y;
			}
			catch (exception)
			{

			}
			objectLocal.y = 'a:98z';

			// GET Before
			expect(callbackGetBeforeX).not.toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBeforeX.calls.count()).toBe(0);

			expect(callbackGetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBeforeY.calls.count()).toBe(0);

			expect(callbackGetBefore).not.toHaveBeenCalledWith(objectLocal, 'x');
			expect(callbackGetBefore).not.toHaveBeenCalledWith(objectLocal, 'y');
			expect(callbackGetBefore.calls.count()).toBe(0);

			// GET
			expect(callbackGetX).not.toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetX.calls.count()).toBe(0);

			expect(callbackGetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetY.calls.count()).toBe(0);

			expect(callbackGet).not.toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGet).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGet.calls.count()).toBe(0);

			// GET After
			expect(callbackGetAfterX).not.toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfterX.calls.count()).toBe(0);

			expect(callbackGetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfterY.calls.count()).toBe(0);

			expect(callbackGetAfter).not.toHaveBeenCalledWith(objectLocal, 'x', 10);
			expect(callbackGetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'y:12a');
			expect(callbackGetAfter.calls.count()).toBe(0);

			// SET Before
			expect(callbackSetBeforeX).toHaveBeenCalledWith(objectLocal, 'x', 12, undefined);
			expect(callbackSetBeforeX.calls.count()).toBe(1);

			expect(callbackSetBeforeY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', undefined);
			expect(callbackSetBeforeY.calls.count()).toBe(0);

			expect(callbackSetBefore).toHaveBeenCalledWith(objectLocal, 'x', 12, undefined);
			expect(callbackSetBefore).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', undefined);
			expect(callbackSetBefore.calls.count()).toBe(1);

			// SET
			expect(callbackSetX).toHaveBeenCalledWith(objectLocal, 'x', 12, undefined);
			expect(callbackSetX.calls.count()).toBe(1);

			expect(callbackSetY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', undefined);
			expect(callbackSetY.calls.count()).toBe(0);

			expect(callbackSet).toHaveBeenCalledWith(objectLocal, 'x', 12, undefined);
			expect(callbackSet).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', undefined);
			expect(callbackSet.calls.count()).toBe(1);

			// SET After
			expect(callbackSetAfterX).toHaveBeenCalledWith(objectLocal, 'x', 12, undefined);
			expect(callbackSetAfterX.calls.count()).toBe(1);

			expect(callbackSetAfterY).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', undefined);
			expect(callbackSetAfterY.calls.count()).toBe(0);

			expect(callbackSetAfter).toHaveBeenCalledWith(objectLocal, 'x', 12, undefined);
			expect(callbackSetAfter).not.toHaveBeenCalledWith(objectLocal, 'y', 'a:98z', undefined);
			expect(callbackSetAfter.calls.count()).toBe(1);

			// values
			expect(resultX).toBeUndefined();
			expect(objectLocal.x).toBeUndefined();
			expect(objectLocal._x).toBe(12);
			expect(resultY).toBeUndefined();
			expect(objectLocal.y).toBeUndefined();
			expect(objectLocal._y).toBe('a:98z');

			observerLocal.unobserve();
		});
	});
});
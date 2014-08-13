'use strict';

require(
[
	'jQuery',
	'forge/object/base'
], function(
	jQuery,
	Base
)
{
	describe('forge/object/base', function()
	{
		it('should only trigger events which have a listener', function()
		{
			var parameters = [1, 2, 'a'];
			var callbackjQueryObjectTriggerHandler = jasmine.createSpy('callbackjQueryObjectTriggerHandler');

			var base = new Base(
			{
				on:
				{
					'nuff': function() {}
				}
			});
			expect(base.registeredEventCounters['nuff']).toBe(1);

			base.jQueryObject.triggerHandler = callbackjQueryObjectTriggerHandler;

			base.trigger('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).toHaveBeenCalledWith('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(1);

			base.trigger('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).not.toHaveBeenCalledWith('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(1);

			base.trigger('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).toHaveBeenCalledWith('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(2);

			base.trigger('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).not.toHaveBeenCalledWith('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(2);

			base.on('nuff', function(){});
			expect(base.registeredEventCounters['nuff']).toBe(2);

			base.trigger('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).toHaveBeenCalledWith('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(3);

			base.trigger('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).not.toHaveBeenCalledWith('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(3);

			base.off('nuff');
			expect(base.registeredEventCounters['nuff']).toBe(1);

			base.trigger('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).toHaveBeenCalledWith('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(4);

			base.trigger('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).not.toHaveBeenCalledWith('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(4);

			base.off('nuff');
			expect(base.registeredEventCounters['nuff']).toBeUndefined();

			base.trigger('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).toHaveBeenCalledWith('nuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(4);

			base.trigger('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler).not.toHaveBeenCalledWith('nuffnuff', parameters);
			expect(callbackjQueryObjectTriggerHandler.calls.count()).toBe(4);
		});
	});
});
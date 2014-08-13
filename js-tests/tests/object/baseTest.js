'use strict';

require(
[
	'forge/object/base'
], function(
	Base
)
{
	describe('forge/object/base', function()
	{
		it('should only trigger events which have a listener', function()
		{
			var callbackEventNuff1 = jasmine.createSpy('callbackEventNuff1');
			var callbackEventNuff2 = jasmine.createSpy('callbackEventNuff2');

			var base = new Base(
			{
				on:
				{
					'nuff': callbackEventNuff1
				}
			});

			expect(base.events['nuff']).toEqual(
			[
				{
					callback: callbackEventNuff1,
					context: undefined,
					ctx: undefined
				}
			]);

			base.trigger('nuff', 1, 2, 'a');

			expect(callbackEventNuff1).toHaveBeenCalledWith(1, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(1);

			base.trigger('nuffnuff', 2, 2, 'a');

			expect(callbackEventNuff1).not.toHaveBeenCalledWith(2, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(1);

			base.trigger('nuff', 3, 2, 'a');
			expect(callbackEventNuff1).toHaveBeenCalledWith(3, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(2);

			base.trigger('nuffnuff', 4, 2, 'a');
			expect(callbackEventNuff1).not.toHaveBeenCalledWith(4, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(2);

			base.on('nuff', callbackEventNuff2, jasmine);
			expect(base.events['nuff']).toEqual(
			[
				{
					callback: callbackEventNuff1,
					context: undefined,
					ctx: undefined
				},
				{
					callback: callbackEventNuff2,
					context: jasmine,
					ctx: jasmine
				}
			]);

			base.trigger('nuff', 5, 2, 'a');
			expect(callbackEventNuff1).toHaveBeenCalledWith(5, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(3);

			expect(callbackEventNuff2).toHaveBeenCalledWith(5, 2, 'a');
			expect(callbackEventNuff2.calls.count()).toBe(1);

			base.trigger('nuffnuff', 6, 2, 'a');
			expect(callbackEventNuff1).not.toHaveBeenCalledWith(6, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(3);

			expect(callbackEventNuff2).not.toHaveBeenCalledWith(6, 2, 'a');
			expect(callbackEventNuff2.calls.count()).toBe(1);

			base.off('nuff', callbackEventNuff2, jasmine);
			expect(base.events['nuff']).toEqual(
			[
				{
					callback: callbackEventNuff1,
					context: undefined,
					ctx: undefined
				}
			]);

			base.trigger('nuff', 7, 2, 'a');
			expect(callbackEventNuff1).toHaveBeenCalledWith(7, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(4);

			expect(callbackEventNuff2).not.toHaveBeenCalledWith(7, 2, 'a');
			expect(callbackEventNuff2.calls.count()).toBe(1);

			base.trigger('nuffnuff', 8, 2, 'a');
			expect(callbackEventNuff1).not.toHaveBeenCalledWith(8, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(4);

			expect(callbackEventNuff2).not.toHaveBeenCalledWith(8, 2, 'a');
			expect(callbackEventNuff2.calls.count()).toBe(1);

			base.off('nuff');
			expect(base.events).toEqual({});

			base.trigger('nuff', 9, 2, 'a');
			expect(callbackEventNuff1).not.toHaveBeenCalledWith(9, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(4);

			expect(callbackEventNuff2).not.toHaveBeenCalledWith(9, 2, 'a');
			expect(callbackEventNuff2.calls.count()).toBe(1);

			base.trigger('nuffnuff', 10, 2, 'a');
			expect(callbackEventNuff1).not.toHaveBeenCalledWith(10, 2, 'a');
			expect(callbackEventNuff1.calls.count()).toBe(4);

			expect(callbackEventNuff2).not.toHaveBeenCalledWith(10, 2, 'a');
			expect(callbackEventNuff2.calls.count()).toBe(1);
		});

		it('should remove all listeners', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off();
			expect(base.events).toEqual({});
		});

		it('should remove listeners only by event name', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off('c');
			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
		});

		it('should remove listeners only by callback', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off(undefined, callback5, undefined);
			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback7);
		});

		it('should remove listeners only by context', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off(undefined, undefined, jasmine);
			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
		});

		it('should remove listeners by event name and callback', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off('a', callback5);
			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);
		});

		it('should remove listeners by callback and context', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off(undefined, callback6, jasmine);
			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);
		});

		it('should remove listeners by event name and callback and context', function()
		{
			var callback1 = jasmine.createSpy();
			var callback2 = jasmine.createSpy();
			var callback3 = jasmine.createSpy();
			var callback4 = jasmine.createSpy();
			var callback5 = jasmine.createSpy();
			var callback6 = jasmine.createSpy();
			var callback7 = jasmine.createSpy();
			var base = new Base();

			expect(base.events).toEqual({});

			base.on(
			{
				a: callback1,
				b: callback2,
				c: callback3
			});
			base.on('b', callback4);
			base.on('a c', callback5);
			base.on('a', callback6, jasmine);
			base.on('b c', callback7, jasmine);

			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
			expect(base.events.c[2].callback).toBe(callback7);

			base.off('c', callback7, jasmine);
			expect(base.events).toEqual(
			{
				'a':
				[
					{
						callback: callback1,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback6,
						context: jasmine,
						ctx: jasmine
					}
				],
				'b':
				[
					{
						callback: callback2,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback4,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback7,
						context: jasmine,
						ctx: jasmine
					}
				],
				'c':
				[
					{
						callback: callback3,
						context: undefined,
						ctx: undefined
					},
					{
						callback: callback5,
						context: undefined,
						ctx: undefined
					}
				]
			});
			expect(base.events.a[0].callback).toBe(callback1);
			expect(base.events.a[1].callback).toBe(callback5);
			expect(base.events.a[2].callback).toBe(callback6);
			expect(base.events.b[0].callback).toBe(callback2);
			expect(base.events.b[1].callback).toBe(callback4);
			expect(base.events.b[2].callback).toBe(callback7);
			expect(base.events.c[0].callback).toBe(callback3);
			expect(base.events.c[1].callback).toBe(callback5);
		});
	});
});
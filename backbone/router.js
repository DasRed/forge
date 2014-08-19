'use strict';
define(
[
	'lodash',
	'jQuery',
	'backbone',
	'forge/backbone/compatibility',
	'forge/backbone/controller'
], function(
	lodash,
	jQuery,
	Backbone,
	compatibility,
	Controller
)
{
	var optionalParam = /\((.*?)\)/g;
	var namedParam = /(\(\?)?:\w+/g;
	var splatParam = /\*\w+/g;

	/**
	 * Router
	 *
	 * @event {void} testRight({Router}, {Rights}) if rights defined on an route entry, this event will be called. if the event THROWs an Error, routing will be aboard
	 * @param {Array} configs
	 * @param {Object} options
	 * @returns {Router}
	 * @example of configs
	 * <code>
	 * 		[
	 *			{
	 *				// can be the controller constructor or a instance of a controller
	 *				controller: ControllerTest,
	 *
	 *				// rights to test for all routes. if it tests, the event "testRight" will be triggered
	 *				// if the event THROWs an Error, routing will be aboard
	 *				// this rights will be merged with every route
	 *				rights: [],
	 *
	 *				// defines all route for this controller. A route entry can be a string or
	 *				// an object with detailed informations
	 *				// every entry can also be an string. they will be converted to object
	 *				routes:
	 *				[
	 *					{
	 *						// defines this route as the default route. This key can only be once TRUE in the whole config
	 *						// this property is optional
	 *						isDefault: true,
	 *
	 *						// defines a route
	 *						// @see http://backbonejs.org/#Router-routes
	 *						route: 'home',
	 *
	 *						// rights to test for a route. if it tests, the event "testRight" will be triggered
	 *						// if the event THROWs an Error, routing will be aboard
	 *						rights: [],
	 *
	 *						// defines the name of the route. This property is optional.
	 *						// @see http://backbonejs.org/#Router-routes
	 *						name: 'homeRoute',
	 *
	 *						// defines the parts of a route without parameters. This property is optional.
	 *						// this property will be use in the internal dispatcher of the controller
	 *						// normaly this property should not be defined and will be generated if not defined.
	 *						// the parts will be generated from the route.
	 *						// @see forge/backbone/controller.js
	 *						// @example "bundle/edit/nuff/:id" will be [bundle, edit, nuff]
	 *						// @example parts is string with "bundle/edit/nuff": will be [bundle, edit, nuff]
	 *						parts: []
	 *					},
	 *
	 *					// defines only a route without detailed informations
	 *					'bundles',
	 *
	 *					// defines only a route without detailed informations
	 *					'bundle/:id',
	 *
	 *					// defines only a route without detailed informations
	 *					'bundle/edit/nuff/:id',
	 *
	 *					// defines only a route without detailed informations
	 *					'keks'
	 *				]
	 *			},
	 *
	 *			// defines more route wiht other controllers
	 *			{
	 *				// controllers and routes definitions here
	 *			}
	 *		]
	 * </code>
	 */
	function Router(configs, options)
	{
		Backbone.Router.call(this, options);

		if ((configs instanceof Array) === false)
		{
			throw new Error('No config was defined. Please give the router a routing config with new Router(configs, options).');
		}

		var defaultConfigRoute = undefined;
		var configsLength = configs.length;
		var config = undefined;
		var i = undefined;

		var routesLength = undefined;
		var route = undefined;
		var j = undefined;
		var routeWithoutParameters = undefined;

		// create the routes
		for (i = 0; i < configsLength; i++)
		{
			config = configs[i];
			if (config.controller === undefined)
			{
				throw new Error('No controller was defined for routing config.');
			}

			if (config.routes === undefined)
			{
				throw new Error('No routes was defined for routing config.');
			}

			routesLength = config.routes.length;
			for (j = 0; j < routesLength; j++)
			{
				route = config.routes[j];
				// convert short
				if (typeof route === 'string')
				{
					route =
					{
						route: route
					};
				}

				// set defaults
				lodash.defaults(route,
				{
					isDefault: false,
					route: route.route,
					name: route.route,
					parts: undefined
				});

				if (config.rights !== undefined)
				{
					config.rights = [];
					route.rights = (route.rights || []).concat(config.rights);
				}

				// define default route
				if (route.isDefault === true)
				{
					if (defaultConfigRoute !== undefined)
					{
						throw new Error('Duplicate default route. First route was "' + defaultConfigRoute.route.name + '" (url://' + defaultConfigRoute.route.route + '). Second default route is "' + route.name + '" (url://' + route.route + ')!');
					}
					defaultConfigRoute =
					{
						config: config,
						route: route
					};
				}

				// create parts from route
				if (route.parts === undefined)
				{
					routeWithoutParameters = route.route.replace(optionalParam, '');
					routeWithoutParameters = routeWithoutParameters.replace(namedParam, function(match, optional)
					{
						return optional ? match : '';
					});
					routeWithoutParameters = routeWithoutParameters.replace(splatParam, '');

					route.parts = lodash.filter(routeWithoutParameters.split('/'), function(routePart)
					{
						return routePart !== null && routePart !== undefined && routePart.length != 0;
					});
				}
				// create parts from string
				else if (typeof route.parts === 'string')
				{
					route.parts = route.parts.split('/');
				}

				// define route in router
				this.route(route.route, route.name, this.handleRouteFromConfig.bind(this, config, route));
				console.debug('Route "' + route.name + '" (url://' + route.route + ') created.');
			};
		}

		// create default
		this.route('*anything', 'default', this.handleRouteFromConfig.bind(this, defaultConfigRoute.config, defaultConfigRoute.route));
		console.debug('Default Route "' + defaultConfigRoute.route.name + '" (url://' + defaultConfigRoute.route.route + ') created.');

		console.debug('initialize');
	}

	// prototype
	Router.prototype = Object.create(Backbone.Router.prototype,
	{
		/**
		 * the current controller
		 *
		 * @var {Controller}
		 */
		controller:
		{
			value: null,
			enumerable: false,
			configurable: true,
			writable: true
		}
	});

	/**
	 * handles the route config
	 *
	 * @param {Object} config
	 * @param {Object} route
	 * @param {Mixed} ... route parameters
	 * @returns {Router}
	 * @see class docs
	 */
	Router.prototype.handleRouteFromConfig = function(config, route)
	{
		console.debug('navigate to "' + route.name + '" (url://' + route.route + ').');

		if (route.rights !== undefined)
		{
			try
			{
				this.trigger('testRight', this, route.rights);
			}
			catch (exception)
			{
				console.error('User has opened the route "' + route.name + '" (url://' + route.route + ') without the rights to open.');
				this.navigate('/',
				{
					trigger: true,
					replace: true
				});
				return this;
			}
		}

		var parameters = Array.prototype.slice.call(arguments);

		// if the last value in parameters undefined or null, remove it. it is an bug from Backbone.Router
		if (parameters.length > 0 && (parameters[parameters.length] === null || parameters[parameters.length] === undefined))
		{
			parameters.pop();
		}

		// the controller is a string... load it with require js
		if (typeof config.controller === 'string')
		{
			var self = this;
			console.debug('Loading controller "' + config.controller + '" with requirejs for "' + route.name + '" (url://' + route.route + ').');
			require(
			[
				config.controller
			], function(
				controller
			)
			{
				config.controller = controller;
				self.startController(config, route, parameters);
			}, function()
			{
				console.error('Can not create the controller "' + config.controller + '" for "' + route.name + '" (url://' + route.route + ').');
			});
		}
		// controller is not a string load lets start
		else
		{
			this.startController(config, route, parameters);
		}

		return this;
	};

	/**
	 * starts the controller
	 *
	 * @param {Object} config
	 * @param {Object} route
	 * @param {Array} parameters
	 * @returns {Router}
	 */
	Router.prototype.startController = function(config, route, parameters)
	{
		// remove previous controller
		if (this.controller !== null && this.controller !== config.controller)
		{
			this.controller.removeLayout();
			this.controller = null;
		}

		// create the instance, if the instance not created
		if ((config.controller instanceof Controller) === false)
		{
			config.controller = new config.controller();
		}
		this.controller = config.controller;

		// add parts to the parameters
		parameters.splice(2, 0, route.parts);

		// dispatch
		this.controller.dispatch.apply(this.controller, parameters);

		console.debug('navigated to "' + route.name + '" (url://' + route.route + ').');

		return this;
	};

	return compatibility(Router);
});
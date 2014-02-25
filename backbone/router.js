'use strict';
define(
[
	'lodash',
	'jQuery',
	'backbone',
	'forge/backbone/controller'
], function(
	lodash,
	jQuery,
	Backbone,
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
	 *				// defines all route for this controller. A route entry can be a string or
	 *				// an object with detailed informations
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
	var Router = function(configs, options)
	{
		Backbone.Router.call(this, options);

		var self = this;
		var defaultConfigRoute = undefined;

		if ((configs instanceof Array) === false)
		{
			throw new Error('No config was defined. Please give the router a routing config with new Router(configs, options).');
		}

		// create the routes
		lodash.each(configs, function(config)
		{
			if (config.controller === undefined)
			{
				throw new Error('No controller was defined for routing config.');
			}

			if (config.routes === undefined)
			{
				throw new Error('No routes was defined for routing config.');
			}

			lodash.each(config.routes, function(route)
			{
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

				// create parts
				if (route.parts === undefined)
				{
					var routeWithoutParameters = route.route.replace(optionalParam, '');
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

				// define route in router
				self.route(route.route, route.name, self.handleRouteFromConfig.bind(self, config, route));
				console.debug('Route "' + route.name + '" (url://' + route.route + ') created.');
			});
		});

		// create default
		this.route('*anything', 'default', this.handleRouteFromConfig.bind(this, defaultConfigRoute.config, defaultConfigRoute.route));
		console.debug('Default Route "' + defaultConfigRoute.route.name + '" (url://' + defaultConfigRoute.route.route + ') created.');

		console.debug('initialize');

		return this;
	};

	// compatibility
	Router.extend = Backbone.Router.extend;

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

		// remove previous controller
		if (this.controller !== null && this.controller !== config.controller)
		{
			this.controller.remove();
			this.controller = null;
		}

		var parameters = lodash.toArray(arguments);

		// if the last value in parameters undefined or null, remove it. it is an bug from Backbone.Router
		if (parameters.length > 0 && (parameters[parameters.length] === null || parameters[parameters.length] === undefined))
		{
			parameters.pop();
		}

		// create the instance
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

	return Router;
});

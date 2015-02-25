'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/backbone/compatibility',
	'forge/backbone/view'
], function(
	lodash,
	Backbone,
	compatibility,
	View
)
{
	/**
	 * Controller
	 *
	 * The controller hold every relevant actions. The internal dispatcher dispatchs a route from
	 * route parts without the parameters in the url. The dispatcher is looking for a method matching
	 * to the route parts with the suffix "Action" during the search. The parts will be reduced from
	 * right to left. All parts of the route parts, which are not used, will be shift to the parameters
	 * for the action method. If no action method can be found with url parts,
	 * the action "indexAction" from "defaultAction" property will be called
	 *
	 * @example Controller has the action "bundleEditAction".
	 * 			the route is "bundle/edit/nuff/:id"
	 * 			the url is "bundle/edit/nuff/10"
	 * 			the url parts are [bundle, edit, nuff]
	 * 			the parameters are [10]
	 * 			the controller tests:
	 * 				1. bundleEditNuffAction -> failed -> adding "nuff" to parameters
	 * 				2. bundleEditAction -> found -> calling "bundleEditAction" with ("nuff", 10)
	 *
	 * @param {Object} options
	 * @returns {Controller}
	 */
	function Controller(options)
	{
		this.layoutCache = {};

		options = options || {};
		lodash.extend(this, options);

		this.cid = lodash.uniqueId('controller');

		this.initialize(options);
	}

	// prototyping
	Controller.prototype = Object.create(Backbone.Events,
	{
		/**
		 * @var {String}
		 */
		cid:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		defaultAction:
		{
			value: 'index',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * layout view
		 *
		 * @returns {View}
		 */
		layout:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Object}
		 */
		layoutCache:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * enableds layout caching
		 *
		 * @var {Boolean}
		 */
		layoutCachingEnabled:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * start for the route parts at index
		 *
		 * @var {Number}
		 */
		routePartsStartsAtIndex:
		{
			value: 0,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * dispatching a route
	 *
	 * @see Class doc
	 * @param {Object} config
	 * @param {Object} route
	 * @param {Array} routeParts
	 * @param {Mixed} ... additional parameters
	 * @returns {Controller}
	 * @see for the config object see forge/backbone/router.js
	 * @see for the route object see forge/backbone/router.js
	 * @see for the routeParts array see forge/backbone/router.js
	 */
	Controller.prototype.dispatch = function(config, route, routeParts)
	{
		// get all additional parameters
		var parameters = Array.prototype.slice.call(arguments, 3);

		// convert to correct type
		parameters = lodash.map(parameters, function(parameter)
		{
			var asNumber = Number(parameter);
			if (parameter !== null && isNaN(asNumber) === false)
			{
				return asNumber;
			}

			return parameter;
		});

		// not starting at index 0?
		if (this.routePartsStartsAtIndex != 0)
		{
			routeParts = routeParts.slice(this.routePartsStartsAtIndex);
		}

		// camel case the parts
		var parts = lodash.map(routeParts, function(routePart, index)
		{
			// the first is lowercase
			if (index === 0)
			{
				return routePart;
			}

			return routePart.charAt(0).toUpperCase() + routePart.slice(1);
		});

		// find calling method
		var actionMethod = null;
		var position = parts.length;
		var listOfTestedMethods = [];
		while ((this[actionMethod] instanceof Function) === false && position > 0)
		{
			actionMethod = parts.slice(0, position).join('') + 'Action';
			listOfTestedMethods.push(actionMethod);
			position--;
		}

		// nothing found
		if ((this[actionMethod] instanceof Function) === false && position == 0)
		{
			actionMethod = undefined;
			position = -1;
		}

		// append the values of routeparts to parameters which not in actionMethod
		parameters = routeParts.slice(position + 1).concat(parameters);

		// default action
		if ((this.defaultAction !== undefined || this.defaultAction !== null) && (actionMethod === undefined || (this[actionMethod] instanceof Function) === false))
		{
			actionMethod = this.defaultAction + 'Action';
			console.info('route "' + route.name + '" (url://' + route.route + ') as no action method ("' + listOfTestedMethods.join('", "') + '"). Using default action method "' + actionMethod + '".');
		}

		if ((this[actionMethod] instanceof Function) === false)
		{
			throw new Error('Action method "' + actionMethod + '" can not be called on controller for route "' + route.name + '" (url://' + route.route + ').');
		}

		// auto layout remove?
		this.removeLayout();

		// create a hash for actionMethod and parameters
		var hash = actionMethod + '/' + parameters.join('/');

		// take layout from cache
		var layout = undefined;

		// caching enabled?
		if (this.layoutCachingEnabled === true)
		{
			layout = this.layoutCache[hash];
		}

		// layout from cache?
		if (layout !== undefined)
		{
			console.debug('dispatching the route "' + route.name + '" (url://' + route.route + ') from cache for method "' + actionMethod + '(' + parameters.join(', ') + ')".');
			layout.attach();
		}
		// create the layout and put it into the cache
		else
		{
			console.debug('dispatching the route "' + route.name + '" (url://' + route.route + ') to method "' + actionMethod + '(' + parameters.join(', ') + ')".');

			// call action and retrieve layout instance
			layout = this[actionMethod].apply(this, parameters);
			
			if (layout === undefined || layout === null)
			{
				return this;
			}
			
			if ((layout instanceof View) === false)
			{
				throw new Error('Action method "' + actionMethod + '" must return a instance of View!');
			}

			// remove from cache if view completely removed
			layout.on('remove', function()
			{
				console.debug('removing layout from cache for the route "' + route.name + '" (url://' + route.route + ') to method "' + actionMethod + '".');
				delete this.layoutCache[hash];
			}, this);

			// store in cache
			this.layoutCache[hash] = layout;
		}

		// store current layout
		this.layout = layout;

		return this;
	};

	/**
	 * @returns {Controller}
	 */
	Controller.prototype.indexAction = function()
	{
		throw new Error('The index action of a controller must be overwritten!');

		return this;
	};

	/**
	 * init
	 *
	 * @param {Object} options
	 * @returns {Controller}
	 */
	Controller.prototype.initialize = function(options)
	{
		return this;
	};

	/**
	 * removing
	 *
	 * @returns {Controller}
	 */
	Controller.prototype.remove = function()
	{
		var hash = undefined;
		for (hash in this.layoutCache)
		{
			this.layoutCache[hash].off(undefined, undefined, this).remove();
			delete this.layoutCache[hash];
		}

		this.removeLayout().stopListening();

		return this;
	};

	/**
	 * removing layout
	 *
	 * @returns {Controller}
	 */
	Controller.prototype.removeLayout = function()
	{
		if (this.layout instanceof View)
		{
			if (this.layoutCachingEnabled === true)
			{	
				this.layout.detach();
			}
			else
			{
				this.layout.remove();
			}
			this.layout = null;
		}

		return this;
	};

	return compatibility(Controller);
});

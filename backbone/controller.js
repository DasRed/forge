'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/backbone/view'
], function(
	lodash,
	Backbone,
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
	var Controller = function(options)
	{
		options = options || {};
		lodash.extend(this, options);

		if (this.views === null)
		{
			this.views = {};
		}

		this.cid = lodash.uniqueId('controller');

		this.initialize.apply(this, arguments);

		return this;
	};

	// compatibility
	Controller.extend = Backbone.View.extend;

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
		 * the default view for this controller.
		 *
		 * @var {View}
		 */
		view:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * default element for the default view
		 */
		viewContainer:
		{
			value: '#content',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * instance of the default view for this controller.
		 *
		 * @var {View}
		 */
		viewInstance:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * a list of views for this controller. will be only removed if controller
		 * is removing
		 *
		 * @var {Object}
		 */
		views:
		{
			value: null,
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
		var parameters = lodash.toArray(arguments).slice(3);

		// camel case the parts
		var parts = lodash.map(routeParts, function(routePart, index)
		{
			if (index == 0)
			{
				return routePart;
			}

			return routePart.charAt(0).toUpperCase() + routePart.slice(1);
		});

		// find calling method
		var actionMethod = null;
		var position = parts.length;
		while ((this[actionMethod] instanceof Function) === false && position > 0)
		{
			actionMethod = parts.slice(0, position).join('') + 'Action';
			position--;
		}

		// append the values of routeparts to parameters which not in actionMethod
		parameters = routeParts.slice(position + 1).concat(parameters);

		// default action
		if ((this.defaultAction !== undefined || this.defaultAction !== null) && (actionMethod === undefined || (this[actionMethod] instanceof Function) === false))
		{
			actionMethod = this.defaultAction + 'Action';
			console.info('route "' + route.name + '" (url://' + route.route + ') as no action method. Using default action method "' + actionMethod + '".');
		}

		if ((this[actionMethod] instanceof Function) === false)
		{
			throw new Error('Action method "' + actionMethod + '" can not be called on controller for route "' + route.name + '" (url://' + route.route + ').');
		}

		console.debug('dispatching the route "' + route.name + '" (url://' + route.route + ') to method "' + actionMethod + '".');

		// call action
		this[actionMethod].apply(this, parameters);

		return this;
	};

	/**
	 * @returns {Controller}
	 */
	Controller.prototype.indexAction = function()
	{
		if (this.view === null)
		{
			throw new Error('The index action of a controller must be overwritten or define a default view!');
		}

		// create the view
		this.viewInstance = this.view;
		var view = this.view;
		this.view = new view(
		{
			container: this.viewContainer
		});

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
		if (this.view instanceof View)
		{
			this.view.remove();
			this.view = this.viewInstance;
		}

		lodash.each(this.views, function(view)
		{
			if (this.view instanceof View)
			{
				this.view.remove();
			}
		});

		return this;
	};

	return Controller;
});

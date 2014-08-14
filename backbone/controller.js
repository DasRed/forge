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
		options = options || {};
		lodash.extend(this, options);

		this.cid = lodash.uniqueId('controller');

		this.initialize.apply(this, arguments);
	}

	// prototyping
	Controller.prototype = Object.create(Backbone.Events,
	{
		/**
		 * removes the layout before the action is called
		 *
		 * @var {Boolean}
		 */
		autoLayoutRemove:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

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
		 * default element for the default view
		 * @var {String}
		 */
		layoutContainer:
		{
			value: '#content',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * default element for the default view
		 *
		 * @var {String}
		 */
		layoutElement:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * instance of the default view for this controller.
		 *
		 * @var {View}
		 */
		layoutInstance:
		{
			value: null,
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
		var parameters = lodash.toArray(arguments).slice(3);

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

		console.debug('dispatching the route "' + route.name + '" (url://' + route.route + ') to method "' + actionMethod + '".');

		// auto layout remove?
		if (this.autoLayoutRemove === true)
		{
			this.removeLayout();
		}

		// call action
		this[actionMethod].apply(this, parameters);

		return this;
	};

	/**
	 * returns the layout
	 *
	 * @param {Object} additionalOptions
	 * @returns {View}
	 */
	Controller.prototype.getLayout = function(additionalOptions)
	{
		if (this.layoutInstance === null)
		{
			// create the view
			var layout = this.layout;

			var options = lodash.extend(
			{
				autoRender: false,
				container: this.layoutContainer,
				el: this.layoutElement
			}, additionalOptions || {});

			this.layoutInstance = new layout(options);

			this.layoutInstance.render();
		}

		return this.layoutInstance;
	};

	/**
	 * @returns {Controller}
	 */
	Controller.prototype.indexAction = function()
	{
		if (this.layout === null)
		{
			throw new Error('The index action of a controller must be overwritten or define a default layout!');
		}

		// create the view
		this.getLayout();

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
		if (this.layoutInstance instanceof View)
		{
			this.layoutInstance.remove();
			this.layoutInstance = null;
		}

		return this;
	};

	/**
	 * setting layout
	 *
	 * @param {View} layout
	 * @returns {Controller}
	 */
	Controller.prototype.setLayout = function(layout)
	{
		this.removeLayout().layoutInstance = layout;

		return this;
	};

	return compatibility(Controller);
});

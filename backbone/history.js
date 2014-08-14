'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/backbone/compatibility'
], function(
	lodash,
	Backbone,
	compatibility
)
{

	/**
	 * History
	 */
	function History()
	{
		// set the new history
		Backbone.history = this;

		Backbone.History.apply(this, arguments);
	}

	// prototype creation
	History.prototype = Object.create(Backbone.History.prototype);

	/**
	 * Add a route to be tested when the fragment changes. Routes added later
	 * may NOT override previous routes.
	 *
	 * in the original function route will be added to the top of the list of routes. THIS IS STUPID
	 * now: new routes will be added to the END of the list of routes. this is more intuitive
	 *
	 * @param {RegExp} route
	 * @param {Function} callback
	 * @returns {History}
	 */
	History.prototype.route = function(route, callback)
	{
		this.handlers.push(
		{
			route: route,
			callback: callback
		});

		return this;
	};

	/**
	 * start history browsing
	 *
	 * @param {Object} options
	 * @returns {History}
	 * @see http://backbonejs.org/#History-start
	 */
	History.prototype.start = function(options)
	{
		var root = window.location.pathname;

		if (window.document.head && window.document.head.baseURI)
		{
			root = (new URL(window.document.head.baseURI)).pathname;
		}

		options = options || {};
		lodash.defaults(options,
		{
			root: root,
			pushState: false
		});

		Backbone.History.prototype.start.call(this, options);

		console.debug('started');

		return this;
	};

	return compatibility(History);
});
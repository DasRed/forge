'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/backbone/compatibility',
	'forge/backbone/view'
], function(
	lodash,
	jQuery,
	compatibility,
	View
)
{
	/**
	 *
	 * @event {void} createView({Layout} layout, {View} view, {Object} config, {String} key)
	 * @event {void} createView[:key]({Layout} layout, {View} view, {Object} config, {String} key)
	 *
	 * @param {Object} options
	 * @returns {Layout}
	 */
	var Layout = function(options)
	{
		this.views = {};
		if (this.configs === null)
		{
			this.configs = {};
		}
		if (this.options === null)
		{
			this.options = {};
		}

		View.apply(this, arguments);

		return this;
	};

	// prototype
	Layout.prototype = Object.create(View.prototype,
	{
		/**
		 * automatic rendering
		 *
		 * @var {Boolean}
		 */
		autoRender:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defining of default element selector "body"
		 *
		 * @var {String}
		 */
		el:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * list of config to deal with views
		 *
		 * @var {Object}
		 * 		{
		 * 			view: {View} undefined
		 *			container: {String}|{HTLMElement}|{jQuery}|{Undefined} undefined
		 *			el: {String}|{HTLMElement}|{jQuery}|{Undefined} undefined
		 *			autoCreate: {Boolean} true
		 *			autoRender: {Boolean} true
		 *			options: {Object}|{Function} {},
		 *			validateRender: {Function}
		 * 		}
		 */
		configs:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * list of additional options for the views
		 *
		 * @var {Object}
		 */
		options:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * list of all created views
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
	 * returns a created view from config
	 *
	 * @param {String} key
	 * @returns {View}
	 */
	Layout.prototype.getView = function(key)
	{
		return this.views[key]
	};

	/**
	 * on create view
	 *
	 * @param {View} view
	 * @param {Object} config
	 * @param {String} key
	 */
	Layout.prototype.onCreateView = function(view, config, key)
	{
		return this;
	};

	/**
	 * remove the layout
	 *
	 * @returns {Layout}
	 */
	Layout.prototype.remove = function()
	{
		// remove instances of views
		lodash.each(this.views, function(view)
		{
			view.remove();
		});
		this.views = {};

		return View.prototype.remove.apply(this, arguments);
	};

	/**
	 * removes a view
	 *
	 * @param {String} key
	 * @returns {Layout}
	 */
	Layout.prototype.removeView = function(key)
	{
		if (this.configs[key] === undefined)
		{
			throw new Error('Unknown view config key "' + key + '" to remove.');
		}

		// remove previous view
		if (this.views[key] instanceof View)
		{
			this.views[key].remove();
			delete this.views[key];
		}

		return this;
	};

	/**
	 * @return {Layout}
	 */
	Layout.prototype.render = function()
	{
		var self = this;

		View.prototype.render.apply(this, arguments);

		lodash.each(this.configs, function(config, key)
		{
			if (lodash.isPlainObject(config) === false)
			{
				throw new Error('A layout config must be a plain object.');
			}

			// set the defaults
			lodash.defaults(config,
			{
				view: undefined,
				container: undefined,
				el: undefined,
				autoCreate: true,
				autoRender: true,
				options: {},
				validateRender: lodash.noop
			});

			// only on autoCreate
			if (config.autoCreate === true)
			{
				this.renderView(key);
			}
		}, this);

		return this;
	};

	/**
	 * renders a view by config key
	 * was the view rendered before. the view will be removed and then rendered again
	 *
	 * @param {String} key
	 * @param {Object} additionalOptions
	 * @returns {Layout}
	 */
	Layout.prototype.renderView = function(key, additionalOptions)
	{
		// remove previous view
		this.removeView(key);

		// validate
		if (this.configs[key] === undefined)
		{
			throw new Error('Unknown view config key "' + key + '" to render.');
		}

		var config = this.configs[key];

		if (lodash.isPlainObject(config) === false)
		{
			throw new Error('A layout config must be a plain object.');
		}

		// valid?
		if (config.view === undefined)
		{
			throw new Error('A layout config view is undefined. A view must be defined.');
		}

		if (config.validateRender instanceof Function && config.validateRender.call(this, this) === false)
		{
			return this;
		}

		// create instance of view if is it needed
		var view = config.view;
		if ((view instanceof View) === false)
		{
			// options
			var options = null;

			// options are function... call the function
			if (config.options instanceof Function)
			{
				options = config.options.call(this, this);
			}
			else
			{
				options = lodash.clone(config.options);
			}

			// set constructor options
			if (this.options[key] !== undefined)
			{
				options = lodash.extend(options, this.options[key]);
			}

			// set additional options
			if (additionalOptions !== undefined)
			{
				options = lodash.extend(options, additionalOptions);
			}

			// set container
			if (config.container !== undefined)
			{
				options.container = this.$el.find(config.container);
			}
			// set element
			if (config.el !== undefined)
			{
				options.el = this.$el.find(config.el);
			}

			// set default options
			lodash.defaults(options,
			{
				layout: this,
				autoRender: false
			});

			view = new view(options);

			// trigger events
			this.trigger('createView:' + key, this, view, config, key);
			this.trigger('createView', this, view, config, key);
			this.onCreateView(view, config, key);
		}

		// remember the view
		this.views[key] = view;

		// view is not autorender...
		if (config.autoRender === true)
		{
			view.render();
		}

		return this;
	};

	return compatibility(Layout);
});

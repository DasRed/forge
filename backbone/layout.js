'use strict';

define(
[
	'lodash',
	'jQuery',
	'forge/backbone/view'
], function(
	lodash,
	jQuery,
	View
)
{
	/**
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

	// compatibility
	Layout.extend = View.extend;

	// prototype
	Layout.prototype = Object.create(View.prototype,
	{
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
		 *  @var {Object}
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
				selector: 'body',
				autoRender: true,
				options: {}
			});

			// valid?
			if (config.view === undefined)
			{
				throw new Error('A layout config view is undefined. A view must be defined.');
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
					options = config.options.call(self, self);
				}
				else
				{
					options = lodash.clone(config.options);
				}

				// set constructor options
				if (self.options[key] !== undefined)
				{
					options = lodash.extend(options, self.options[key]);
				}

				// set default options
				lodash.defaults(options,
				{
					el: self.$el.find(config.selector),
					layout: self
				});

				view = new view(options);
			}

			// view is not autorender...
			if (config.autoRender === false)
			{
				view.render();
			}

			// remember the view
			self.views[key] = view;

			console.debug(view.cid + ' rendered');
		});

		return this;
	};

	return Layout;
});
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
		this.views = [];
		if (this.configs === null)
		{
			this.configs = [];
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
			value: 'body',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * list of config to deal with views
		 *
		 * @var {Array}
		 */
		configs:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * list of all created views
		 *
		 *  @var {Array}
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
		this.views = [];

		return View.prototype.remove.apply(this, arguments);
	};

	/**
	 * @return {Layout}
	 */
	Layout.prototype.render = function()
	{
		var self = this;

		View.prototype.render.apply(this, arguments);

		lodash.each(this.configs, function(config)
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
				view = new view(lodash.defaults(config.options,
				{
					el: jQuery(config.selector),
					layout: self
				}));
			}

			// view is not autorender...
			if (config.autoRender === false)
			{
				view.render();
			}

			// remember the view
			self.views.push(view);

			console.debug(view.cid + ' rendered');
		});

		return this;
	};

	return Layout;
});
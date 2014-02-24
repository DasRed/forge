'use strict';
define(
[
	'jQuery',
	'forge/object/base'
], function(
	jQuery,
	Base
)
{
	/**
	 * loads config from script type application json
	 *
	 * @param {String}|{jQuery} element
	 * @param {Object} options
	 * @returns {Loader}
	 */
	var Loader = function(element, options)
	{
		Base.call(this, options);

		this.element = element;

		return this;
	};

	// prototype
	Loader.prototype = Object.create(Base.prototype,
	{
		/**
		 * the loaded config
		 *
		 * @var {Object}
		 */
		config:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				if (this._config === undefined)
				{
					// try to find the user config element
					var element = jQuery(this.element);
					if (element.length === 0)
					{
						throw new Error('Can not find the HTMLElement "' + this.element + '" for configuration.');
					}

					// try to parse the JSON from element
					try
					{
						var config = JSON.parse(element.html());
					}
					catch (exception)
					{
						throw new Error('Can not parse the data from HTMLElement "' + this.element + '" for configuration.\n' + (exception.message || e));
					}

					this._config = config;
				}

				return this._config;
			}
		},

		/**
		 * @var {String}|{jQuery}
		 */
		element:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	return Loader;
});
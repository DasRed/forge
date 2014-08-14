'use strict';
define([], function()
{
	/**
	 * loads config from script type application json
	 *
	 * @param {String} element
	 * @param {Object} options
	 */
	function Loader(element, options)
	{
		this.element = element;

		options = options || {};

		this.throwError = options.throwError !== undefined ? options.throwError : this.throwError;
	}

	// prototype
	Loader.prototype = Object.create(Object.prototype,
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
					var elementId = this.element;
					if (elementId.substr(0, 1) === '#')
					{
						elementId = elementId.substr(1);
					}

					if (typeof document === 'undefined')
					{
						if (this.throwError === true)
						{
							throw new Error('Can not find the documnet node to find configuration element "' + this.element + '".');
						}

						return {};
					}

					// try to find the user config element
					var element = document.getElementById(elementId);
					if (element === null)
					{
						if (this.throwError === true)
						{
							throw new Error('Can not find the HTMLElement "' + this.element + '" for configuration.');
						}

						return {};
					}

					// try to parse the JSON from element
					try
					{
						var config = JSON.parse(element.innerHTML);
					}
					catch (exception)
					{
						if (this.throwError === true)
						{
							throw new Error('Can not parse the data from HTMLElement "' + this.element + '" for configuration.\n' + (exception.message || e));
						}

						return {};
					}

					this._config = config;
				}

				return this._config;
			}
		},

		/**
		 * @var {String}
		 */
		element:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Boolean}
		 */
		throwError:
		{
			value: true,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	return Loader;
});
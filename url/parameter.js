'use strict';
define(
[
	'lodash',
	'forge/object/base'
], function(
	lodash,
	Base
)
{
	var parametersRegExp = /\((.*?)\)|(\(\?)?:\w+/g;

	/**
	 * @param {String} url
	 * @param {Object} options
	 * @returns {UrlParameter}
	 */
	var UrlParameter = function(url, options)
	{
		this.url = url;
		Base.call(this, options);

		return this;
	};

	// prototype
	UrlParameter.prototype = Object.create(Base.prototype,
	{
		/**
		 * @var {Array}
		 */
		parameters:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				// extract url parameters
				if (this._parameters === undefined)
				{
					this._parameters = lodash.map(this.url.match(parametersRegExp) || [], function(parameter)
					{
						var parameterOptions =
						{
							name: null,
							optional: false
						};

						// optional
						if (parameter.substr(0, 1) == '(')
						{
							parameterOptions.optional = true;
							parameterOptions.name = parameter.substr(3, parameter.length - 4);
						}
						// none optional
						else
						{
							parameterOptions.name = parameter.substr(1);
						}
						return parameterOptions;
					});
				}

				return this._parameters;
			}
		},

		/**
		 * defined the url
		 *
		 * @var {String}
		 */
		url:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._url;
			},
			set: function(url)
			{
				this._url = url;
				delete this._parameters;
			}
		}
	});

	/**
	 * parse the url with given object
	 *
	 * @param {Object} values
	 * @returns {String}
	 */
	UrlParameter.prototype.parse = function(values)
	{
		return lodash.reduce(this.parameters, function(url, parameterOptions)
		{
			// get the value
			var value = values[parameterOptions.name];

			// optional parameter
			if (parameterOptions.optional === true)
			{
				// no value
				if (value === undefined || value === null)
				{
					// removing
					return url.replace('(/:' + parameterOptions.name + ')', '');
				}

				// with value
				// replace parameter with value
				return url.replace('(/:' + parameterOptions.name + ')', '/' + value);
			}

			// required paramter but not setted
			if (value === undefined || value === null)
			{
				throw new Error('The url "' + this.url + '" requires the parameter "' + parameterOptions.name + '" but the value is not setted.');
			}

			// replacing value
			return url.replace(':' + parameterOptions.name, value);
		}, this.url || '', this);
	};

	return UrlParameter;
});
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
	var parametersOptionalReplaceRegExp = /^[^A-Za-z0-9\-\_]+|[^A-Za-z0-9\-\_]+$/g;

	/**
	 * @param {String} url
	 * @param {Object} options
	 */
	function UrlParameter(url, options)
	{
		this.url = url;
		Base.call(this, options);
	}

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
							optional: false,
							regExp: null
						};

						// optional
						if (parameter.substr(0, 1) == '(')
						{
							parameterOptions.optional = true;
							parameterOptions.name = parameter.replace(parametersOptionalReplaceRegExp, '');
							parameterOptions.regExp = new RegExp('\\((.*?)\\:' + parameterOptions.name + '(.*?)\\)', 'g');
						}
						// none optional
						else
						{
							parameterOptions.name = parameter.substr(1);
							parameterOptions.regExp = new RegExp('\\:' + parameterOptions.name, 'g');
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
	 * @param {Object}|{Array} values
	 * @param {Object}|{Array} ...
	 * @returns {String}
	 */
	UrlParameter.prototype.parse = function()
	{
		var args = arguments;

		// convert argument array to object
		lodash.each(args, function(argument, index)
		{
			if (argument instanceof Array)
			{
				args[index] = lodash.reduce(argument, function(acc, value, index)
				{
					// out of range... unknown parameter
					if (this.parameters.length - 1 < index)
					{
						return acc;
					}

					// key value list
					acc[this.parameters[index].name] = value;

					return acc;
				}, {}, this);
			}
		}, this);

		// collect values from object
		var values = lodash.reduce(this.parameters, function(acc, parameterOptions)
		{
			return lodash.reduce(args, function(acc, argument)
			{
				if (argument[parameterOptions.name] !== undefined)
				{
					acc[parameterOptions.name] = argument[parameterOptions.name];
				}

				return acc;
			}, acc);
		}, {});

		return lodash.reduce(this.parameters, function(url, parameterOptions)
		{
			// get the value
			var value = values[parameterOptions.name];
			var valueEscaped = window.encodeURIComponent(value);

			// optional parameter
			if (parameterOptions.optional === true)
			{
				// no value
				if (value === undefined || value === null)
				{
					// removing
					return url.replace(parameterOptions.regExp, '');
				}

				// with value
				// replace parameter with value
				return url.replace(parameterOptions.regExp, '$1' + valueEscaped + '$2');
			}

			// required paramter but not setted
			if (value === undefined || value === null)
			{
				throw new Error('The url "' + this.url + '" requires the parameter "' + parameterOptions.name + '" but the value is not setted.');
			}

			// replacing value
			return url.replace(parameterOptions.regExp, valueEscaped);
		}, this.url || '', this);
	};

	return UrlParameter;
});
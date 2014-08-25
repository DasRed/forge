'use strict';

define(
[
	'lodash'
], function(
	lodash
)
{
	/**
	 * translation
	 *
	 * @param {Object} translations
	 * @param {Object} options
	 */
	function Translation(translations, options)
	{
		this.translations = {};

		options = options || {};

		this.locale = options.locale !== undefined ? options.locale : this.locale;
		this.regexpParameters = options.regexpParameters !== undefined ? options.regexpParameters : this.regexpParameters;
		this.regexpTranslations = options.regexpTranslations !== undefined ? options.regexpTranslations : this.regexpTranslations;

		this.setTranslations(translations);
	}

	// prototype
	Translation.prototype = Object.create(Object.prototype,
	{
		/**
		 * current defined locale
		 *
		 * @var {String}
		 */
		locale:
		{
			value: 'en-GB',
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * regexp to transform parameters in translations into object template property
		 *
		 * @var {RegExp}
		 */
		regexpParameters:
		{
			value: /\\?\[([^\[\]]+)\]/g,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * regexp for translations identify
		 *
		 * @var {RegExp}
		 */
		regexpTranslations:
		{
			value: /[\\\$]?\{([^{}]+)\}/g,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * translation for the current locale
		 *
		 * @var {Object}
		 */
		translation:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				if (this.translations[this.locale] === undefined)
				{
					return {};
				}
				return this.translations[this.locale];
			}
		},

		/**
		 * all translations in structure. structure is
		 * 	LOCALE:
		 * 		TRKEY => VALUE
		 * 		...
		 *
		 * TRKEY is defined bei "TRFILE.TRINDEX" given from backend
		 *
		 * @var {Object}
		 */
		translations:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * set Translations
	 *
	 * @param {Object} translations
	 * @returns {Translation}
	 */
	Translation.prototype.setTranslations = function(translations)
	{
		var locale = undefined;
		var fileName = undefined;
		var trKey = undefined;

		for (locale in translations)
		{
			if (this.translations[locale] === undefined)
			{
				this.translations[locale] = {};
			}

			for (fileName in translations[locale])
			{
				for (trKey in translations[locale][fileName])
				{
					this.translations[locale][fileName + '.' + trKey] = translations[locale][fileName][trKey];
				}
			}
		}

		return this;
	};

	/**
	 * translate a text with given parameters
	 *
	 * @param {String} key
	 * @param {Object} parameters
	 * @param {String} defaults
	 * @returns {String}
	 */
	Translation.prototype.translate = function(key, parameters, defaults)
	{
		if (key.charAt(0) === '{')
		{
			key = key.slice(1);
		}
		if (key.charAt(key.length - 1) === '}')
		{
			key = key.slice(0, key.length - 1);
		}

		var text = this.translation[key];

		if (text === undefined)
		{

			if (defaults === undefined)
			{
				return '{' + key + '}';
			}
			text = defaults;
		}

		// parameter replacemant
		text = lodash.reduce(parameters, function(acc, value, name)
		{
			return acc.replace(new RegExp('\\[' + name + '\\]', 'gi'), value);
		}, text);

		return text;
	};

	/**
	 * inline translation
	 *
	 * @param {String} text
	 * @returns {String}
	 */
	Translation.prototype.translateInline = function(text)
	{
		var self = this;

		// replace the text
		text = text.replace(this.regexpTranslations, function(match, key)
		{
			switch (match.charAt(0))
			{
				case '\\':
					return match.slice(1);
				case '$':
					return match;
			}

			return self.translate(key, undefined, match);
		});

		// parameters conversion
		text = text.replace(this.regexpParameters, '${$1}');

		return text;
	};

	return Translation;
});
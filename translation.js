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
	/**
	 * translation
	 *
	 * @param {Object} translations
	 * @param {Object} options
	 * @returns {Translation}
	 */
	var Translation = function(translations, options)
	{
		this.translations = {};

		Base.call(this, options);

		this.setTranslations(translations);

		return this;
	};

	// prototype
	Translation.prototype = Object.create(Base.prototype,
	{
		/**
		 * current defined language
		 *
		 * @var {String}
		 */
		language:
		{
			value: 'en_GB',
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
		 * translation for the current language
		 *
		 * @var {Object}
		 */
		translation:
		{
			enumerable: false,
			configurable: false,
			get: function()
			{
				if (this.translations[this.language] === undefined)
				{
					return {};
				}
				return this.translations[this.language];
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
		for (var language in translations)
		{
			if (this.translations[language] === undefined)
			{
				this.translations[language] = {};
			}

			for (var fileName in translations[language])
			{
				for (var trKey in translations[language][fileName])
				{
					this.translations[language][fileName + '.' + trKey] = translations[language][fileName][trKey];
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
			text = defaults !== undefined ? defaults : key;
		}

		// parameter replacemant
		text = lodash.reduce(parameters, function(text, value, name)
		{
			return text.replace(new RegExp('\\[' + name + '\\]', 'gi'), value);
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
		// replace the text
		text = text.replace(this.regexpTranslations, (function(match, key)
		{
			switch (match.charAt(0))
			{
				case '\\':
					return match.slice(1);
				case '$':
					return match;
			}

			return this.translate(key, undefined, match);
		}).bind(this));

		// parameters conversion
		text = text.replace(this.regexpParameters, '${$1}')

		return text;
	};

	return Translation;
});
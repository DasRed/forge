'use strict';

define(
[
	'text',
	'lodash',
	'jQuery',
	'forge/object/base'
], function(
	text,
	lodash,
	jQuery,
	Base
)
{
	/**
	 * translation
	 *
	 * @param {Object} translations
	 * @param {Object} options
	 * @return {Translation}
	 */
	var Translation = function(translations, options)
	{
		this.translations = {};

		Base.call(this, options);

		this.setTranslations(translations).initialize();

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
			value: 'de_DE',
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
	 * initialize and starting auto translation
	 *
	 * @returns {Translation}
	 */
	Translation.prototype.initialize = function()
	{
		// overwrite require text onload function
		var textFinishLoad = text.finishLoad;
		text.finishLoad = (function(name, strip, content, onLoad)
		{
			content = this.translate(content);

			return textFinishLoad.call(text, name, strip, content, onLoad);
		}).bind(this);

		// find all loaded text
		for (var key in require.s.contexts._.defined)
		{
			if (key.substr(0, 5) === 'text!')
			{
				window.require.s.contexts._.defined[key] = this.translate(require.s.contexts._.defined[key]);
			}
		}

		return this;
	};

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
	 * @param {String} test
	 * @returns {String}
	 */
	Translation.prototype.translate = function(text)
	{
		// replace the text
		text = text.replace(this.regexpTranslations, (function(match, name)
		{
			switch (match.charAt(0))
			{
				case '\\':
					return match.slice(1);
				case '$':
					return match;
			}

			var value = this.translation[name];

			if (value === undefined)
			{
				return match;
			}

			return value;
		}).bind(this));

		// replace the parameters
		text = text.replace(this.regexpParameters, '${$1}')

		return text;
	};

	return Translation;
});
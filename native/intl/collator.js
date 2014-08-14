'use strict';

define(
[
	'lodash'
], function(
	lodash
)
{
	/**
	 * create a stub
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator
	 * @param {String}|{Array} locales
	 * @param {Object} options
	 */
	function NativeIntlCollator(locales, options)
	{
		if (typeof locales === 'string')
		{
			locales = [locales];
		}

		this.locales = lodash.clone(locales || []);
		this.options = lodash.defaults(lodash.clone(options || {}),
		{
			localeMatcher: 'best fit',
			usage: 'sort',
			sensitivity: 'variant',
			ignorePunctuation: false,
			numeric: false,
			caseFirst: false
		});
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator/supportedLocalesOf
	 * @param {String}|{Array} locales
	 * @param {Object} options
	 * @returns {Array}
	 */
	NativeIntlCollator.supportedLocalesOf = function(locales, options)
	{
		console.warn('The function NativeIntlCollator.supportedLocalesOf is only a stub.');
		return [];
	};

	// prototyping
	NativeIntlCollator.prototype = Object.create(Object.prototype,
	{
		/**
		 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
		 * @var {Array}
		 */
		locales:
		{
			value: true,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator
		 * @var {Object}
		 */
		options:
		{
			value: true,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator/format
	 * @param {String} string1
	 * @param {String} string2
	 * @returns {Number}
	 */
	NativeIntlCollator.prototype.compare = function(string1, string2)
	{
		if (typeof string1 !== 'string' || typeof string2 !== 'string')
		{
			return NaN;
		}

		if (string1 === string2)
		{
			return 0;
		}

		if (string1 < string2)
		{
			return -1;
		}

		return 0;
	};

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator/resolvedOptions
	 * @returns {Object}
	 */
	NativeIntlCollator.prototype.resolvedOptions = function()
	{
		return {
			locale: lodash.first(this.locales),
			usage: this.options.usage,
			sensitivity: this.options.sensitivity,
			ignorePunctuation: this.options.ignorePunctuation,
			collation: undefined,
			numeric: this.options.numeric,
			caseFirst: this.options.caseFirst
		};
	};

	return NativeIntlCollator;
});
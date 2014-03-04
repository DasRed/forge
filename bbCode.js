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
	 * BBCode parser
	 *
	 * @param {Object} codes
	 * @param {Object} options
	 * @return {BBCode}
	 */
	var BBCode = function(codes, options)
	{
		this.codes = {};

		Base.call(this, options);

		this.setCodes(codes);

		return this;
	};

	// prototype
	BBCode.prototype = Object.create(Base.prototype,
	{

		/**
		 * all codes in structure.
		 *
		 * @var {Object}
		 */
		codes:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * set bb codes
	 *
	 * @param {Object} codes
	 * @returns {BBCode}
	 */
	BBCode.prototype.setCodes = function(codes)
	{
		this.codes = lodash.map(codes, function(replacement, regex)
		{
			return {
				regexp: new RegExp(regex.slice(1, regex.lastIndexOf('#')), 'igm'),
				replacement: replacement
			};
		});

		return this;
	};

	/**
	 * parse
	 *
	 * @param {String} text
	 * @returns {String}
	 */
	BBCode.prototype.parse = function(text)
	{
		return lodash.reduce(this.codes, function(text, code)
		{
			return text.replace(code.regexp, code.replacement);
		}, text);
	};

	return BBCode;
});
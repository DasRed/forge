'use strict';

define([], function()
{
	/**
	 * a new DOMTokenListShim
	 */
	function DOMTokenListShim(element)
	{
		this.element = element;
		this.map = {};

		var trimmedClasses = (this.element.getAttribute('class') || '').trim();
		var tokens = trimmedClasses ? trimmedClasses.split(/\s+/) : [];
		var length = tokens.length;

		for (var i = 0; i < length; i++)
		{
			this.push(tokens[i]);
			this.map[tokens[i]] = i;
		}
	}

	/**
	 * converts token string list of 'a b c' to array ['a', 'b', 'c'] and filters empty entries
	 *
	 * @var {Array} tokens
	 * @returns {Array}
	 */
	DOMTokenListShim.convertTokens = function (tokens)
	{
		var result = new Array();
		var tokensPerArgument = undefined;
		var token;
		var i;
		var j;
		var lenT;
		var len = tokens.length;

		for (i = 0; i < len; i++)
		{
			token = tokens[i] + '';
			if (token === '')
			{
				continue;
			}

			tokensPerArgument = token.split(' ');
			for (j = 0, lenT = tokensPerArgument.length; j < lenT; j++)
			{
				if (tokensPerArgument[j] === '')
				{
					continue;
				}

				result.push(tokensPerArgument[j]);
			}
		}

		return result;
	};

	// prototype
	DOMTokenListShim.prototype = Object.create(Array.prototype,
	{
		/**
		 * @var {Element}
		 */
		element:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Object}
		 */
		map:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * @var {Function}
		 */
		updateClassName:
		{
			value: function()
			{
				this.element.setAttribute('class', this.toString());
			},
			enumerable: false,
			configurable: false,
			writable: true
		}
	});

	/**
	 * @param {String} ...
	 */
	DOMTokenListShim.prototype.add = function()
	{
		var tokens = DOMTokenListShim.convertTokens(arguments);
		var length = tokens.length;
		var token;
		var updated = false;

		// nothing to do
		if (length === 0)
		{
			return;
		}

		// loop over all tokens
		for (var i = 0; i < length; i++)
		{
			token = tokens[i];

			// found... already in list... next
			if (this.map[token] !== undefined)
			{
				continue;
			}

			// append and add to quick access
			this.push(token);
			this.map[token] = this.length - 1;

			// we must update!
			updated = true;
		}

		// lets update
		if (updated === true)
		{
			this.updateClassName();
		}
	};

	/**
	 * @param {Stgring} token
	 * @returns {Boolean}
	 */
	DOMTokenListShim.prototype.contains = function(token)
	{
		return this.map[token] !== undefined;
	};

	/**
	 * @param {Number} i
	 * @returns {String}
	 */
	DOMTokenListShim.prototype.item = function(i)
	{
		if (this[i] === undefined)
		{
			return null;
		}

		return this[i];
	};

	/**
	 * @param {String} ...
	 */
	DOMTokenListShim.prototype.remove = function()
	{
		var tokens = DOMTokenListShim.convertTokens(arguments);
		var length = tokens.length;
		var token;
		var updated = false;

		// nothing to do
		if (length === 0)
		{
			return;
		}

		// loop over all tokens
		for (var i = 0; i < length; i++)
		{
			token = tokens[i];

			// not found... not in list... next
			if (this.map[token] === undefined)
			{
				continue;
			}

			// remove and delete from quick access
			this.splice(this.map[token], 1);
			delete this.map[token];

			// we must update!
			updated = true;
		}

		// lets update
		if (updated === true)
		{
			this.updateClassName();
		}
	};

	/**
	 * @param {String} token
	 * @param {boolean} force
	 * @returns {Boolean}
	 */
	DOMTokenListShim.prototype.toggle = function(token, force)
	{
		if (force === true)
		{
			this.add(token);
			return true;
		}
		else if (force === false)
		{
			this.remove(token);
			return false;
		}
		else if (this.contains(token) === false)
		{
			this.add(token);
			return true;
		}

		this.remove(token);
		return false;
	};

	/**
	 * @returns {String}
	 */
	DOMTokenListShim.prototype.toString = function()
	{
		return this.join(' ');
	};

	return DOMTokenListShim;
});
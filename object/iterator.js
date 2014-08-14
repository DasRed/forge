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
	 * Iterator
	 *
	 * @param {Object} options
	 */
	function Iterator(options)
	{
		this.data = {};

		Base.call(this, options);
	}

	// prototype
	Iterator.prototype = Object.create(Base.prototype,
	{
		/**
		 * the data
		 *
		 * @var {Object}
		 */
		data:
		{
			value: null,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * returns the length
		 *
		 * @returns {Number}
		 */
		length:
		{
			configurable: true,
			enumerable: true,
			get: function()
			{
				return this.keys().length;
			}
		}
	});

	/**
	 * fügt einen neuen eintrag hinzu
	 *
	 * @param {String} key
	 * @param {Object} entry
	 * @returns {Iterator}
	 */
	Iterator.prototype.add = function(key, entry)
	{
		if (this.data[key] !== undefined)
		{
			this.remove(key);
		}

		this.data[key] = entry;

		return this;
	};

	/**
	 * entfernt alles
	 *
	 * @returns {Iterator}
	 */
	Iterator.prototype.clear = function()
	{
		delete this.data;

		this.data = {};

		return this;
	};

	/**
	 * liefert den eintrag sofern vorhanden ansonsten NULL
	 *
	 * @param {String} key
	 * @returns {Object}
	 */
	Iterator.prototype.get = function(key)
	{
		if (this.data[key] !== undefined)
		{
			return this.data[key];
		}

		return null;
	};

	/**
	 * iteriert über alle einträge
	 *
	 * @param {Function} callback [entry, key, data]
	 * @returns {Iterator}
	 */
	Iterator.prototype.each = function(callback)
	{
		lodash.each(this.data, callback);

		return this;
	};

	/**
	 * exists
	 *
	 * @param {String} key
	 * @returns {Boolean}
	 */
	Iterator.prototype.exists = function(key)
	{
		return this.data[key] !== undefined;
	};

	/**
	 * sucht einen eintrag
	 *
	 * @param {Function} callback [entry, key, data]
	 * @returns {Object}
	 */
	Iterator.prototype.find = function(callback)
	{
		return lodash.find(this.data, callback);
	};

	/**
	 * liefert alle Keys
	 *
	 * @returns {Array}
	 */
	Iterator.prototype.keys = function()
	{
		return lodash.keys(this.data);
	};

	/**
	 * reduce
	 *
	 * @param {Function} callback [previousValue, entry, key, data]
	 * @param {Mixed} initialValue
	 * @returns {Mixed}
	 */
	Iterator.prototype.reduce = function(callback, initialValue)
	{
		return lodash.reduce(this.data, callback, initialValue);
	};

	/**
	 * entfernt einen eintrag
	 *
	 * @param {Mixed} key
	 * @returns {Iterator}
	 */
	Iterator.prototype.remove = function(key)
	{
		if (this.data[key] !== undefined)
		{
			delete this.data[key];
		}

		return this;
	};

	return Iterator;
});
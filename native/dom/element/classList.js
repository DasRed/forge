'use strict';

define(
[
	'forge/native/dom/token/list'
], function(
	DOMTokenList
)
{
	// classList is not supported, define classList
	if (('classList' in document.body) === false)
	{
		Object.defineProperties(window.Element.prototype,
		{
			_classList:
			{
				value: null,
				enumerable: false,
				configurable: false,
				writable: true
			},
			classList:
			{
				get: function()
				{
					if (this._classList === null)
					{
						this._classList = new DOMTokenList(this);
					}
					return this._classList;
				},
				enumerable: true,
				configurable: true
			}
		});
	}
});

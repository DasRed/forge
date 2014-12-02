'use strict';

define(
[
	'forge/native/dom/element/matches'
], function()
{
	if (('closests' in document.body) === false)
	{
		window.Element.prototype.closest = function(selector)
		{
			if (this.matches(selector))
			{
				return this;
			}

			var el = this;
			var parent = undefined;
			// traverse parents
			while (el !== null)
			{
				parent = el.parentElement;
				if (parent !== null && parent.matches(selector))
				{
					return parent;
				}
				el = parent;
			}

			return null;
		};
	}
});
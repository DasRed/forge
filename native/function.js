'use strict';

define(
[
	'lodash'
], function(
	lodash
)
{
	// create the bind function?
	if (Function.prototype.bind === undefined)
	{
		Function.prototype.bind = function()
		{
			var args = lodash.toArray(arguments);
			args.unshift(this);

			return lodash.bind.apply(lodash, args);
		};
	}
});
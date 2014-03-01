'use strict';
define(
[
	'backbone'
], function(Backbone)
{
	return function(ObjectConstructor)
	{
		ObjectConstructor.extend = Backbone.View.extend;
		ObjectConstructor.prototype.constructor = ObjectConstructor;

		return ObjectConstructor;
	};
});

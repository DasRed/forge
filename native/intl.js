'use strict';

define(
[
	'forge/node_modules/intl/Intl.complete',
	'forge/native/intl/collator'
], function(
	IntlPolyfill,
	NativeIntlCollator
)
{
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
	if (window.Intl === undefined)
	{
		window.Intl = IntlPolyfill;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator
	if (window.Intl.Collator === undefined)
	{
		window.Intl.Collator = NativeIntlCollator;
	}
});
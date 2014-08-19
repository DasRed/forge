'use strict';

define([], function()
{
	/**
	 * window console does not exists in IE versions smaller then 10
	 *
	 * @see http://blogs.technet.com/b/iede/archive/2011/08/23/console-logging-im-internet-explorer-8-9.aspx
	 */
	if (window.console === undefined)
	{
		window.console = {};
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/console.error
	if ((window.console.error instanceof Function) === false)
	{
		window.console.error = function() {};
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/console.warn
	if ((window.console.warn instanceof Function) === false)
	{
		window.console.warn = function() {};
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/console.info
	if ((window.console.info instanceof Function) === false)
	{
		window.console.info = function() {};
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/console.log
	if ((window.console.log instanceof Function) === false)
	{
		window.console.log = function() {};
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/console.debug
	if ((window.console.debug instanceof Function) === false)
	{
		window.console.debug = function() {};
	}
});
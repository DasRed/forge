'use strict';

require(
[
	'lodash',
	'jQuery'
], function(
	lodash,
	jQuery
)
{
	var config = window.applicationConfig.log;

	/**
	 * window console does not exists in IE versions smaller then 10
	 *
	 * @see http://blogs.technet.com/b/iede/archive/2011/08/23/console-logging-im-internet-explorer-8-9.aspx
	 */
	if (window.console === undefined)
	{
		window.console =
		{
			error: function() {},
			warn: function() {},
			info: function() {},
			log: function() {},
			debug: function() {}
		};
	}

	// log levels
	console.LEVEL_CRITICAL = 1;
	console.LEVEL_ALERT = 2;
	console.LEVEL_ERROR = 3;
	console.LEVEL_WARN = 4;
	console.LEVEL_NOTICE = 5;
	console.LEVEL_INFO = 6;
	console.LEVEL_DEBUG = 7;

	var hasColorSupport = (navigator.appName != 'Microsoft Internet Explorer' && navigator.appName != 'Opera');
	var hasWhiteSpaceSupport = (navigator.appName != 'Microsoft Internet Explorer');

	var warnText = {}
	warnText[console.LEVEL_CRITICAL] = 'critical';
	warnText[console.LEVEL_ALERT] = 'alert';
	warnText[console.LEVEL_ERROR] = 'error';
	warnText[console.LEVEL_WARN] = 'warn ';
	warnText[console.LEVEL_NOTICE] = 'notice ';
	warnText[console.LEVEL_INFO] = 'info ';
	warnText[console.LEVEL_DEBUG] = 'debug';

	/**
	 * colors
	 */
	var colors =
	{
		grey: 'color: #777777;',
		green: 'color: #00AA00;',
		blue: 'color: #0000CC;',
		turquoise: 'color: #00AAAA;',
		yellow: 'color: #AAAA00;',
		pink: 'color: #CC00CC;',
		red: 'color: #CC0000;',
		black: 'color: #000000;'
	};

	/**
	 * returns the script name of caller
	 *
	 * @returns {String}
	 */
	var getScriptName = function()
	{
		var stack = (new Error()).stack.match(/http\:\/\/(.*?)\.js/gi);
		var source = stack[stack.length - 1];
		if (stack.length >= 4)
		{
			source = stack[3];
		}
		return source.replace(window.document.head.baseURI, '').replace(window.location.href, '').replace('.js', '').replace(/^(js-src|js)\//gi, '');
	};

	/**
	 * wrapper function for console functions
	 *
	 * @param {String} warnLevel
	 * @param {Function} proceed
	 * @param {String} color if content in "color" starts with "color: #" thenn it is used als color value, otherwise as log message
	 * @param {Profiler} profiler instance of Profiler... is profiler then no send to server available
	 * @param {Mixed} ...
	 * @param {Mixed} ...
	 * ...
	 */
	var wrapper =  function(warnLevel, proceed, color, profiler)
	{
		var warnLevelMin = (config.level ? config.level : console.LEVEL_WARN);
		if (warnLevel > warnLevelMin)
		{
			return;
		}

		var date = new Date();

		// get primitiv values from date
		var day = String(date.getDate());
		var month = String(date.getMonth() + 1);
		var year = String(date.getFullYear());

		var hours = String(date.getHours());
		var minutes = String(date.getMinutes());
		var seconds = String(date.getSeconds());
		var milliseconds = String(date.getMilliseconds());

		// make it readable for humans. we need more maschines. long live skynet
		day = (day.length < 2 ? '0' : '') + day;
		month = (month.length < 2 ? '0' : '') + month;

		hours = (hours.length < 2 ? '0' : '') + hours;
		minutes = (minutes.length < 2 ? '0' : '') + minutes;
		seconds = (seconds.length < 2 ? '0' : '') + seconds;
		milliseconds = (milliseconds.length < 3 ? '0' : '') + milliseconds;
		milliseconds = (milliseconds.length < 3 ? '0' : '') + milliseconds;

		// make human readable date string
		var dateString = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds;

		// make args to array.
		var args = lodash.toArray(arguments);
		// first in args is warnlevel. must be removed
		// second in args is wrapped function. must be removed
		args.shift();
		args.shift();

		// define a color for log message
		var colorValue = null;
		if (typeof color === 'string' && color.substr(0, 8) == 'color: #')
		{
			// has color support
			if (hasColorSupport === true)
			{
				colorValue = color;
			}
			args.shift();
		}

		var isProfiling = false;
		if (window.Profiler !== undefined && profiler === window.Profiler)
		{
			args.shift();
			isProfiling = true;
		}

		// send to server
		if (config.sendToServer == true && isProfiling === false)
		{
			jQuery.ajax(
			{
				url: config.serverUrl,
				method: 'POST',
				data:
				{
					warnLevel: warnLevel,
					timestamp: date.toISOString(),
					message: lodash.reduce(args, function(result, value)
					{
						return result + (result != '' ? ' ' : '') + String(value);
					}, '')
				}
			});
		}

		// if this runs in the ie. the IE does not make spaces between the argument entries
		// so we fixed it for IE
		if (hasWhiteSpaceSupport === false)
		{
			args = lodash.reduce(args, function(result, value)
			{
				result.push(' ');
				result.push(value);
				return result;
			}, []);
		}

		// create parameters
		var parameters = ['[' + warnText[warnLevel] + '] [' + dateString + '] [' + getScriptName() + ']'].concat(args);

		// filter with reg exp
		if (window.sessionStorage.consoleFilter !== undefined && window.sessionStorage.consoleFilter !== '')
		{
			var filterByRegex = new RegExp(window.sessionStorage.consoleFilter, 'gi');
			if (lodash.find(parameters, function(logValue)
			{
				if (typeof logValue === 'string')
				{
					return filterByRegex.test(logValue);
				}

				return false;
			}) === undefined)
			{
				return undefined;
			}
		}

		// run original function for console
		if (proceed.apply)
		{
			// add color informations to parameters
			if (colorValue !== null)
			{
				var prependString = '%c';
				for (var i = 0; i < parameters.length; i++)
				{
					if (i > 0)
					{
						prependString += ' ';
					}
					switch (typeof parameters[i])
					{
						case 'string':
						case 'number':
						case 'boolean':
							prependString += '%s';
							break;

						default:
							prependString += '%o';
							break;
					}
				}
				parameters.unshift(colorValue);
				parameters.unshift(prependString);
			}

			return proceed.apply(this, parameters);
		}
		// IE8 does not support .apply on the console functions :(
		else
		{
			return proceed(parameters.join(''));
		}
	};

	// Backup
	var consoleError = console.error;
	var consoleWarn = console.warn;
	var consoleInfo = console.info;
	var consoleLog = console.log;
	var consoleDebug = console.debug;

	// wraps all log functions
	console.critical = lodash.partial(wrapper, console.LEVEL_CRITICAL, consoleError);
	console.alert = lodash.partial(wrapper, console.LEVEL_ALERT, consoleError);
	console.error = lodash.partial(wrapper, console.LEVEL_ERROR, consoleError);

	console.warn = lodash.partial(wrapper, console.LEVEL_WARN, consoleWarn);
	console.notice = lodash.partial(wrapper, console.LEVEL_NOTICE, consoleWarn);

	console.info = lodash.partial(wrapper, console.LEVEL_INFO, consoleInfo);

	console.debug = lodash.partial(wrapper, console.LEVEL_DEBUG, consoleDebug);
	console.log = lodash.partial(wrapper, console.LEVEL_DEBUG, consoleLog);

	lodash.each(colors, function(colorValue, colorName)
	{
		colorName = colorName.substr(0, 1).toUpperCase() + colorName.substr(1);

		console['critical' + colorName] = lodash.partial(wrapper, console.LEVEL_CRITICAL, consoleError, colorValue);
		console['alert' + colorName] = lodash.partial(wrapper, console.LEVEL_ALERT, consoleError, colorValue);
		console['error' + colorName] = lodash.partial(wrapper, console.LEVEL_ERROR, consoleError, colorValue);

		console['warn' + colorName] = lodash.partial(wrapper, console.LEVEL_WARN, consoleWarn, colorValue);
		console['notice' + colorName] = lodash.partial(wrapper, console.LEVEL_NOTICE, consoleWarn, colorValue);

		console['info' + colorName] = lodash.partial(wrapper, console.LEVEL_INFO, consoleInfo, colorValue);

		console['debug' + colorName] = lodash.partial(wrapper, console.LEVEL_DEBUG, consoleDebug, colorValue);
		console['log' + colorName] = lodash.partial(wrapper, console.LEVEL_DEBUG, consoleLog, colorValue);
	});
});
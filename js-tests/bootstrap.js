'use strict';

(function(window, requirejs)
{
	// wrapping require js config so that the original configuration can be overwritten
	var requirejsConfig = requirejs.config;
	requirejs.config = function(config)
	{
		config.deps = config.shim.main.deps;

		return requirejsConfig.call(requirejs, config);
	};
})(window, requirejs);
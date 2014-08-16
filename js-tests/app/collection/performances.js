'use strict';

define(
[
	'forge/backbone/collection',
	'model/performance'
], function(
	Collection,
	ModelPerformance
)
{
	var CollectionPerformances = Collection.extend(
	{
		/**
		 * @var {String}
		 */
		comparator: 'id',

		/**
		 * @var {Number}
		 */
		count: 1000,

		/**
		 * @var {ModelPerformance}
		 */
		model: ModelPerformance,

		/**
		 * @var {String}
		 */
		url: 'app/collection/performance/:count.json'
	});

	return CollectionPerformances;
});
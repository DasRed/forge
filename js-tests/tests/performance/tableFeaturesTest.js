'use strict';

require(
[
	'lodash',
	'forge/profiler',
	'collection/performances',
	'view/performance/list',
	'view/performance/list/entry'
], function(
	lodash,
	Profiler,
	CollectionPerformance,
	ViewPerformanceList,
	ViewPerformanceListEntry
)
{
	var times = {};
	var env = 'excel';
	env = 'testing';
	var testConfigs =
	{
		countOfRows: env === 'excel' ? 100 : 10,
		countOfIteration: env === 'excel' ? 10 : 1,

		tests:
		{
			'none features':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'all features':
			{
				list:
				{
					autoModelBindings: true,
					autoModelSave: true,
					autoModelUpdate: true,
					autoTemplatesAppend: true,
					sorterOptions: true
				},
				entry:
				{
					autoModelBindings: true,
					autoModelSave: true,
					autoModelUpdate: true,
					autoTemplatesAppend: true
				}
			},
			'table/entry.autoModelBindings = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: true,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'table/entry.autoModelSave = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: true,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'table/entry.autoModelUpdate = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: true,
					autoTemplatesAppend: false
				}
			},
			'table/entry.autoTemplatesAppend = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: true
				}
			},
			'table.autoModelBindings = true':
			{
				list:
				{
					autoModelBindings: true,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'table.autoModelSave = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: true,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'table.autoModelUpdate = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: true,
					autoTemplatesAppend: false,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'table.autoTemplatesAppend = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: true,
					sorterOptions: null
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			},
			'table.sorterOptions = true':
			{
				list:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false,
					sorterOptions: true
				},
				entry:
				{
					autoModelBindings: false,
					autoModelSave: false,
					autoModelUpdate: false,
					autoTemplatesAppend: false
				}
			}
		}
	};

	Number.prototype._duration = function()
	{
		return this.toLocaleString('de-de',
		{
			minimumFractionDigits: 3
		});
	};

	describe('forge/backbone/view/table tableFeatures performance test', function()
	{
		it('should be tested with 1 iteration and 10 rows to compare the average values', function()
		{
			expect(testConfigs.countOfRows).toBe(10);
			expect(testConfigs.countOfIteration).toBe(1);
		});

		var profiler = new Profiler(
		{
			timeout: false
		});

		lodash.each(testConfigs.tests, function(testConfig, key)
		{
			times[key] =
			{
				fetch: 0,
				viewCreate: 0,
				render: 0,
				row: 0
			};

			lodash.each(new Array(testConfigs.countOfIteration), function(value, index)
			{
				var timeData = times[key];
				it(key + ' (#' + (index + 1) + ')', function(done)
				{
					// settings properties on list
					for (var propertyName in testConfig.list)
					{
						ViewPerformanceList.prototype[propertyName] = testConfig.list[propertyName];
					}

					// settings properties on list entry
					for (var propertyName in testConfig.entry)
					{
						ViewPerformanceListEntry.prototype[propertyName] = testConfig.entry[propertyName];
					}

					console.log('tableFeatures forge/backbone/view/table performance test ' + key + ' (#' + (index + 1) + ')');

					// create collection
					var collection = new CollectionPerformance(null,
					{
						count: testConfigs.countOfRows
					});

					// bind events
					collection.once('fetched', function()
					{
						timeData.fetch += profiler.getTime('fetch', true);

						// create view
						profiler.start('viewCreate');
						var view = new ViewPerformanceList(
						{
							autoRender: false,
							collection: collection,
							container: '#content'
						});
						timeData.viewCreate += profiler.getTime('viewCreate', true);

						var renderEntryOriginal = view.renderEntry;
						view.renderEntry = function()
						{
							profiler.start('row');
							var result = renderEntryOriginal.apply(this, arguments);
							timeData.row += profiler.getTime('row', true);
							return result;
						};

						// render
						profiler.start('render');
						view.render();
						timeData.render += profiler.getTime('render', true);

						view.remove();

						collection._reset();

						// all done
						done();
					});

					// fetch the collection
					profiler.start('fetch');
					collection.fetch();
				});
			});
		});

		it('output', function()
		{
			var text = [];
			var timeFirst = null;
			lodash.each(times, function(timeData, testName)
			{
				if (timeFirst === null)
				{
					timeFirst = timeData;
					text.push(lodash.reduce(Object.keys(timeFirst), function(acc, profileName)
					{
						return acc.concat(
						[
							profileName + ' AVG',
							profileName + ' AVG - First',
							profileName,
							profileName + ' - First',
						]);
					}, ['Test Name']).join(';'));
				}

				// log measures
				console.log('------------------ tableFeatures forge/backbone/view/table performance test ' + testName);
				console.log('Performance testing iterations: ' + testConfigs.countOfIteration);
				console.log('Performance testing rows: ' + testConfigs.countOfRows);

				text.push(lodash.reduce(timeData, function(acc, time, profileName)
				{
					var totalCurrent = time;
					var avgCurrent = totalCurrent / testConfigs.countOfIteration;

					var totalFirst = timeFirst[profileName];
					var avgFirst = totalFirst / testConfigs.countOfIteration;

					if (profileName === 'row')
					{
						totalCurrent /= testConfigs.countOfRows;
						avgCurrent /= testConfigs.countOfRows;

						totalFirst /= testConfigs.countOfRows;
						avgFirst /= testConfigs.countOfRows;
					}

					console.log('[' + profileName + '           ]: ' + avgCurrent._duration() + ' (Total: ' + totalCurrent._duration() + ')');
					console.log('[' + profileName + ' Diff First]: ' + (avgCurrent - avgFirst)._duration() + ' (Total: ' + (totalCurrent - totalFirst)._duration() + ')');

					return acc.concat(
					[
						avgCurrent._duration(),
						(avgCurrent - avgFirst)._duration(),
						totalCurrent._duration(),
						(totalCurrent - totalFirst)._duration()
					]);
				}, [testName]).join(';'));
			});

			console.log('------------------ tableFeatures forge/backbone/view/table performance test CSV');
			console.log(text.join('\n'));
			console.log('------------------');
		});

		if (testConfigs.countOfIteration === 1 || testConfigs.countOfRows === 10)
		{
			var validMaxAvgValues =
			{
				'none features':							{fetch: 12,		viewCreate: 2,		render: 17,		row: 3		},
				'all features':								{fetch: 3,		viewCreate: 2,		render: 114,	row: 11		},
				'table/entry.autoModelBindings = true':		{fetch: 6,		viewCreate: 2,		render: 105,	row: 11		},
				'table/entry.autoModelSave = true':			{fetch: 3,		viewCreate: 2,		render: 8,		row: 3		},
				'table/entry.autoModelUpdate = true':		{fetch: 5,		viewCreate: 2,		render: 9,		row: 3		},
				'table/entry.autoTemplatesAppend = true':	{fetch: 3,		viewCreate: 2,		render: 15,		row: 3		},
				'table.autoModelBindings = true':			{fetch: 5,		viewCreate: 2,		render: 8,		row: 3		},
				'table.autoModelSave = true':				{fetch: 3,		viewCreate: 2,		render: 9,		row: 3		},
				'table.autoModelUpdate = true':				{fetch: 5,		viewCreate: 2,		render: 8,		row: 3		},
				'table.autoTemplatesAppend = true':			{fetch: 3,		viewCreate: 2,		render: 9,		row: 3		},
				'table.sorterOptions = true':				{fetch: 5,		viewCreate: 2,		render: 8,		row: 3		}
			};

			for (var testName in validMaxAvgValues)
			{
				it(testName + ' should have retrieve good average values', function()
				{

					for (var profileName in validMaxAvgValues[testName])
					{
						var value = times[testName][profileName] / testConfigs.countOfIteration;
						if (profileName === 'row')
						{
							value /= testConfigs.countOfRows;
						}

						expect(value).toBeLessOrEqualThen(validMaxAvgValues[testName][profileName]);
					}
				});
			}
		};
	});
});

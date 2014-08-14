'use strict';

require(
[
	'forge/backbone/compatibility',
	'forge/backbone/collection',
	'forge/backbone/model'
], function(
	compatibility,
	Collection,
	Model
)
{
	var ModelModelSub = Model.extend(
	{
		attributeTypes:
		{
			id: Model.ATTRIBUTE_TYPE_NUMBER
		}
	});

	var CollectionModelSubs = Collection.extend(
	{
		model: ModelModelSub
	});

	function ModelModel(attributes, options)
	{
		Model.apply(this, arguments);
	}

	ModelModel.prototype = Object.create(Model.prototype,
	{
		a:
		{
			value: 'nuff'
		},
		attributeTypes:
		{
			value:
			{
				id: Model.ATTRIBUTE_TYPE_NUMBER,
				string: Model.ATTRIBUTE_TYPE_STRING,
				number: Model.ATTRIBUTE_TYPE_NUMBER,
				date: Model.ATTRIBUTE_TYPE_DATE,
				bool: Model.ATTRIBUTE_TYPE_BOOLEAN,
				model: Model.ATTRIBUTE_TYPE_MODEL,
				modelPropertyUndefined: Model.ATTRIBUTE_TYPE_MODEL,
				modelPropertyNull: Model.ATTRIBUTE_TYPE_MODEL,
				modelPropertyNotAModel: Model.ATTRIBUTE_TYPE_MODEL,
				collection: Model.ATTRIBUTE_TYPE_COLLECTION,
				collectionPropertyUndefined: Model.ATTRIBUTE_TYPE_COLLECTION,
				collectionPropertyNull: Model.ATTRIBUTE_TYPE_COLLECTION,
				collectionPropertyNotAModel: Model.ATTRIBUTE_TYPE_COLLECTION,
				unknown: 'unknown'
			}
		},
		model:
		{
			get: function()
			{
				if (this._model === undefined)
				{
					this._model = new ModelModelSub();
				}

				return this._model;
			}
		},
		modelPropertyUndefined: {value: undefined},
		modelPropertyNull: {value: null},
		modelPropertyNotAModel: {value: function() {}},
		collection:
		{
			get: function()
			{
				if (this._collection === undefined)
				{
					this._collection = new CollectionModelSubs();
				}

				return this._collection;
			}
		},
		collectionPropertyUndefined: {value: undefined},
		collectionPropertyNull: {value: null},
		collectionPropertyNotAModel: {value: function() {}}
	});
	ModelModel = compatibility(ModelModel);

	describe('forge/backbone/model', function()
	{
		it('constructor should throw an error, it the model property "attributeTypes" is not defined', function()
		{
			expect(function()
			{
				new Model();
			}).toThrowError('The property "attributeTypes" of a model must be defined!');
		});

		it('constructor should copy the options', function()
		{
			var model = new ModelModel(undefined,
			{
				a: 'nuffnuff',
				b: 'rolfcopter'
			});

			expect(model.a).toBe('nuffnuff');
			expect(model.b).toBeUndefined();
		});

		it('method "parse" should throw an error if an attribute given which is not defined in attributeTypes', function()
		{
			var model = new ModelModel();

			expect(function()
			{
				model.parse({nuff: 1});
			}).toThrowError('Can not parse model property "nuff" in model. The property is not defined in "attributeTypes"!');
		});

		describe('method "parse" should convert the property values of type', function()
		{
			var parseTestCases = {};

			// testcase collection
			parseTestCases[Model.ATTRIBUTE_TYPE_COLLECTION] =
			[
				{
					parse: {collection: [{id: 11}, {id: 12}, {id: 13}]}, expect: function(model, attributes)
					{
						expect(model.collection.length).toBe(3);
						expect(model.collection.get(11)).not.toBeUndefined();
						expect(model.collection.get(12)).not.toBeUndefined();
						expect(model.collection.get(13)).not.toBeUndefined();
						expect(model.collection.get(11).attributes).toEqual({id: 11});
						expect(model.collection.get(12).attributes).toEqual({id: 12});
						expect(model.collection.get(13).attributes).toEqual({id: 13});
						expect(attributes.collection).toBeUndefined();
					}
				},
				{parse: {collectionPropertyUndefined: {id: 1}}, error: 'The model property "collectionPropertyUndefined" must be an instance of Collection to use the attribute type "collection" on the attribute "collectionPropertyUndefined".'},
				{parse: {collectionPropertyNull: {id: 1}}, error: 'The model property "collectionPropertyNull" must be an instance of Collection to use the attribute type "collection" on the attribute "collectionPropertyNull".'},
				{parse: {collectionPropertyNotAModel: {id: 1}}, error: 'The model property "collectionPropertyNotAModel" must be an instance of Collection to use the attribute type "collection" on the attribute "collectionPropertyNotAModel".'},
			];

			// testcase model
			parseTestCases[Model.ATTRIBUTE_TYPE_MODEL] =
			[
				{
					parse: {model: {id: 10}}, expect: function(model, attributes)
					{
						expect(model.model.attributes).toEqual({id: 10});
						expect(attributes.model).toBeUndefined();
					}
				},
				{parse: {modelPropertyUndefined: {id: 1}}, error: 'The model property "modelPropertyUndefined" must be an instance of Model to use the attribute type "model" on the attribute "modelPropertyUndefined".'},
				{parse: {modelPropertyNull: {id: 1}}, error: 'The model property "modelPropertyNull" must be an instance of Model to use the attribute type "model" on the attribute "modelPropertyNull".'},
				{parse: {modelPropertyNotAModel: {id: 1}}, error: 'The model property "modelPropertyNotAModel" must be an instance of Model to use the attribute type "model" on the attribute "modelPropertyNotAModel".'},
			];

			// testcase number
			parseTestCases[Model.ATTRIBUTE_TYPE_NUMBER] =
			[
				{parse: {id: 10}, result: {id: 10}},
				{parse: {id: 10.99}, result: {id: 10.99}},
				{parse: {id: '10'}, result: {id: 10}},
				{parse: {id: '10.99'}, result: {id: 10.99}},
				{parse: {id: '-10'}, result: {id: -10}},
				{parse: {id: '-10.99'}, result: {id: -10.99}},
				{parse: {id: 'A'}, error: 'The model property "id" must be a number but the value "A" can not be converted to a number.'},
				{parse: {id: NaN}, error: 'The model property "id" must be a number but the value "NaN" can not be converted to a number.'},
				{parse: {id: {a:1}}, error: 'The model property "id" must be a number but the value "[object Object]" can not be converted to a number.'}
			];

			// testcase boolean
			parseTestCases[Model.ATTRIBUTE_TYPE_BOOLEAN] =
			[
				{parse: {bool: true}, result: {bool: true}},
				{parse: {bool: 'True'}, result: {bool: true}},
				{parse: {bool: 'TRUE'}, result: {bool: true}},
				{parse: {bool: 'True'}, result: {bool: true}},
				{parse: {bool: false}, result: {bool: false}},
				{parse: {bool: 'False'}, result: {bool: false}},
				{parse: {bool: 'FALSE'}, result: {bool: false}},
				{parse: {bool: 'False'}, result: {bool: false}},
				{parse: {bool: 'A'}, result: {bool: false}},
				{parse: {bool: ''}, result: {bool: false}},
				{parse: {bool: '10.99'}, result: {bool: true}},
				{parse: {bool: 10.99}, result: {bool: true}},
				{parse: {bool: '-10.99'}, result: {bool: true}},
				{parse: {bool: -10.99}, result: {bool: true}},
				{parse: {bool: 0}, result: {bool: false}},
				{parse: {bool: '10'}, result: {bool: true}},
				{parse: {bool: 10}, result: {bool: true}},
				{parse: {bool: '-10'}, result: {bool: true}},
				{parse: {bool: -10}, result: {bool: true}},
				{parse: {bool: NaN}, result: {bool: false}},
				{parse: {bool: '1'}, result: {bool: true}},
				{parse: {bool: 1}, result: {bool: true}},
				{parse: {bool: {a:1}}, result: {bool: false}}
			];

			// testcase date
			parseTestCases[Model.ATTRIBUTE_TYPE_DATE] =
			[
				{parse: {date: '2014-08-13T14:32:50.426Z'}, result: {date: new Date('2014-08-13T14:32:50.426Z')}},
				{parse: {date: 'nuff'}, error: 'Model attribute "date" with "nuff" is not an date.'},
				{parse: {date: 'NaN'}, error: 'Model attribute "date" with "NaN" is not an date.'},
				{parse: {date: NaN}, error: 'Model attribute "date" with "NaN" is not an date.'},
				{parse: {date: {a:1}}, error: 'Model attribute "date" with "[object Object]" is not an date.'}
			];

			// testcase string
			parseTestCases[Model.ATTRIBUTE_TYPE_STRING] =
			[
				{parse: {string: '2014-08-13T14:32:50.426Z'}, result: {string: '2014-08-13T14:32:50.426Z'}},
				{parse: {string: 10}, result: {string: '10'}},
				{parse: {string: 10.99}, result: {string: '10.99'}},
				{parse: {string: -10}, result: {string: '-10'}},
				{parse: {string: -10.99}, result: {string: '-10.99'}},
				{parse: {string: NaN}, result: {string: 'NaN'}},
				{parse: {string: {a:1}}, result: {string: '[object Object]'}}
			];

			// testcase UNKNOWN
			parseTestCases['unknown'] =
			[
				{parse: {unknown: 1}, error: 'Model attributeType "unknown" does not exists.'}
			];

			for (var dataType in parseTestCases)
			{
				if (parseTestCases[dataType].length === 0)
				{
					xit(dataType, function() {});
					continue;
				}

				describe(dataType + ' in test case', (function(testCases)
				{
					for (var i = 0; i < testCases.length; i++)
					{
						it('#' + i, (function(testCase)
						{
							var model = new ModelModel();

							if (testCase.expect !== undefined)
							{
								model.parse(testCase.parse);
								testCase.expect(model, testCase.parse);
							}
							else if (testCase.error !== undefined)
							{
								expect(function()
								{
									model.parse(testCase.parse);
								}).toThrowError(testCase.error);
							}
							else
							{
								expect(model.parse(testCase.parse)).toEqual(testCase.result);
							}
						}).bind(this, testCases[i]));
					}
				}).bind(this, parseTestCases[dataType]));
			}
		});

//
//
//
//
//
//
//
//
//					expect(model.parse(
//			{
//				id: '10',
//				string: 'String',
//				number: 111.111,
//				date: '2014-08-13T14:32:50.426Z',
//				date: 'TRUE'
//			})).toEqual(
//			{
//				id: 10,
//				string: 'String',
//				number: 111.111,
//				date: new Date(1407940370426),
//				bool: true
//			});

	});
});
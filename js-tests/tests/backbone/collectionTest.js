'use strict';

require(
[
	'forge/backbone/collection',
	'forge/backbone/collection/sorter',
	'forge/backbone/model'
], function(
	Collection,
	CollectionSorter,
	Model
)
{
	var ModelCollection = Model.extend(
	{
		attributeTypes:
		{
			id: Model.ATTRIBUTE_TYPE_NUMBER,
			sort: Model.ATTRIBUTE_TYPE_NUMBER
		}
	});

	var CollectionCollection = Collection.extend(
	{
		a: 'nuff',
		comparator: 'id',
		direction: CollectionSorter.DIRECTION_DESC,
		model: ModelCollection
	});

	var CollectionUnsorted = Collection.extend(
	{
		comparator: null,
		model: ModelCollection
	});

	var CollectionNoModel = Collection.extend({});

	describe('forge/backbone/collection', function()
	{
		it('constructor should copy the options', function()
		{
			var collection = new CollectionCollection(undefined,
			{
				a: 'nuffnuff',
				b: 'rolfcopter'
			});

			expect(collection.a).toBe('nuffnuff');
			expect(collection.b).toBeUndefined();
		});

		it('constructor must throw an error, if not model ist defined', function()
		{
			expect(function()
			{
				new CollectionNoModel();
			}).toThrowError('A collection must define a model.');

			expect(function()
			{
				new CollectionNoModel(undefined,
				{
					model: ModelCollection
				});
			}).not.toThrowError('A collection must define a model.');
		});

		it('method "sort" must sort the collection', function()
		{
			var model1 = new ModelCollection({id: 7, sort: 16});
			var model2 = new ModelCollection({id: 4, sort: 35});
			var model3 = new ModelCollection({id: 1, sort: 49});
			var model4 = new ModelCollection({id: 3, sort: 73});

			var collection = new CollectionCollection([model1, model2, model3, model4]);
			expect(collection.models[0]).toBe(model1);
			expect(collection.models[1]).toBe(model2);
			expect(collection.models[2]).toBe(model4);
			expect(collection.models[3]).toBe(model3);

			collection.direction = CollectionSorter.DIRECTION_ASC;
			expect(collection.models[0]).toBe(model3);
			expect(collection.models[1]).toBe(model4);
			expect(collection.models[2]).toBe(model2);
			expect(collection.models[3]).toBe(model1);

			collection.comparator = 'sort';
			expect(collection.models[0]).toBe(model1);
			expect(collection.models[1]).toBe(model2);
			expect(collection.models[2]).toBe(model3);
			expect(collection.models[3]).toBe(model4);

			collection.direction = CollectionSorter.DIRECTION_DESC;
			expect(collection.models[0]).toBe(model4);
			expect(collection.models[1]).toBe(model3);
			expect(collection.models[2]).toBe(model2);
			expect(collection.models[3]).toBe(model1);

			collection.comparator = 'id';
			expect(collection.models[0]).toBe(model1);
			expect(collection.models[1]).toBe(model2);
			expect(collection.models[2]).toBe(model4);
			expect(collection.models[3]).toBe(model3);

			var collection = new CollectionUnsorted([model1, model2, model3, model4]);
			expect(collection.models[0]).toBe(model1);
			expect(collection.models[1]).toBe(model2);
			expect(collection.models[2]).toBe(model3);
			expect(collection.models[3]).toBe(model4);
		});
	});
});
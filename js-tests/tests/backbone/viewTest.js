'use strict';

require(
[
	'forge/backbone/model',
	'forge/backbone/view'
], function(
	Model,
	View
)
{
	var ModelView = Model.extend(
	{
		attributeTypes:
		{
			id: Model.ATTRIBUTE_TYPE_NUMBER,
			string: Model.ATTRIBUTE_TYPE_STRING
		}
	});

	describe('forge/backbone/view', function()
	{
		describe('should autoModelBindings to model', function()
		{
			var model = undefined;
			var originaleOnModelPropertyChange = undefined;
			var spyOnModelPropertyChange = undefined;

			beforeEach(function()
			{
				originaleOnModelPropertyChange = View.prototype.onModelPropertyChange;
				spyOnModelPropertyChange = spyOn(View.prototype, 'onModelPropertyChange').and.callThrough();
				model = new ModelView(
				{
					id: 1,
					string: 'nuff'
				});
			});

			afterEach(function()
			{
				View.prototype.onModelPropertyChange = originaleOnModelPropertyChange;
				originaleOnModelPropertyChange = undefined;
				spyOnModelPropertyChange = undefined;
				model = undefined;
			});

			it('but should never bind to the id attribute', function()
			{
				var ViewView = View.extend(
				{
					autoModelBindings: true,
					autoRender: false,
					model: model
				});

				new ViewView();

				model.attributes.id = 2;
				expect(spyOnModelPropertyChange).not.toHaveBeenCalledWith('id', 2, 1);
				expect(spyOnModelPropertyChange.calls.count()).toBe(0);

				model.attributes.string = 'nuffnuff';
				expect(spyOnModelPropertyChange).toHaveBeenCalledWith('string', 'nuffnuff', 'nuff');
				expect(spyOnModelPropertyChange.calls.count()).toBe(1);
			});

			it('from prototyping', function()
			{
				var ViewView = View.extend(
				{
					autoModelBindings: true,
					autoRender: false,
					model: model
				});

				new ViewView();

				model.attributes.id = 2;
				expect(spyOnModelPropertyChange).not.toHaveBeenCalledWith('id', 2, 1);
				expect(spyOnModelPropertyChange.calls.count()).toBe(0);

				model.attributes.string = 'nuffnuff';
				expect(spyOnModelPropertyChange).toHaveBeenCalledWith('string', 'nuffnuff', 'nuff');
				expect(spyOnModelPropertyChange.calls.count()).toBe(1);
			});

			it('from initialize', function()
			{
				var ViewView = View.extend(
				{
					autoModelBindings: true,
					autoRender: false,
					initialize: function()
					{
						this.model = model;
						return View.prototype.initialize.apply(this, arguments);
					}
				});

				new ViewView();

				model.attributes.id = 2;
				expect(spyOnModelPropertyChange).not.toHaveBeenCalledWith('id', 2, 1);
				expect(spyOnModelPropertyChange.calls.count()).toBe(0);

				model.attributes.string = 'nuffnuff';
				expect(spyOnModelPropertyChange).toHaveBeenCalledWith('string', 'nuffnuff', 'nuff');
				expect(spyOnModelPropertyChange.calls.count()).toBe(1);
			});
		});
	});
});
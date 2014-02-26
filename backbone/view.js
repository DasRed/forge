'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/di',
	'forge/observer/object',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	DI,
	ObserverObject,
	Model
)
{
	var excludeProperties =
	{
		$el: true,
		attributes: true,
		//className: true,
		collection: true,
		el: true,
		events: true,
		id: true,
		model: true,
		tagName: true
	};

	/**
	 * View
	 *
	 * @param {Object} options
	 * @returns {View}
	 */
	var View = function(options)
	{
		options = options || {};

		// remapping from el to container for el #content
		if (options.container === undefined)
		{
			switch (true)
			{
				case options.el == '#content':
				case options.el == jQuery('#content'):
				case options.el == jQuery('#content')[0]:
					options.container = options.el;
					delete options.el;
			}
		}

		// defaults bindings object
		if (this.bindings === null)
		{
			this.bindings = {};
		}

		// defaults events object
		if (this.events === null)
		{
			this.events = {};
		}

		// defaults templates object
		if (this.templates === null)
		{
			this.templates = {};
		}

		// copy options
		lodash.each(options, function(value, key)
		{
			if (excludeProperties[key] === true)
			{
				return;
			}
			if (this[key] !== undefined)
			{
				this[key] = value;
			}
		}, this);

		// convert additional templates to template function
		for (var key in this.templates)
		{
			if (typeof this.templates[key] === 'string')
			{
				this.templates[key] = lodash.template(this.templates[key]);
			}
		}

		// container element
		if (this.container !== null && this.container !== undefined)
		{
			this.container = jQuery(this.container);
		}

		// parent
		Backbone.View.apply(this, arguments);

		// auto render?
		if (this.autoRender === true)
		{
			this.render();
		}

		return this;
	};

	// compatibility
	View.extend = Backbone.View.extend;

	// prototype
	View.prototype = Object.create(Backbone.View.prototype,
	{
		/**
		 * A cached jQuery object for the view's element. A handy reference instead of
		 * re-wrapping the DOM element all the time.
		 *
		 * @var {jQuery}
		 */
		$el:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * A hash of attributes that will be set as HTML DOM element attributes on the view's el
		 * (id, class, data-properties, etc.), or a function that returns such a hash.
		 *
		 * @var {Object}
		 */
		attributes:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * bind all model attributes keys, which are not defined in this.bindings
		 * the selector is '.KEYNAME'
		 * it will be also tested for a callback function "onChange" + PropertyName on the view
		 *
		 * @example propertyName = 'nuff'
		 *			selector = '.nuff'
		 *			callback = 'onChangeNuff'
		 *
		 * @var {Boolean}
		 */
		autoBindings:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * renders the view automatically on creation
		 *
		 * @var {Boolean}
		 */
		autoRender:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * bindings for Model properties to given selector
		 *
		 * @var {Object}
		 * @example 'modelAttributeValue': 'CSSSelector'
		 * @example 'modelAttributeValue': Function
		 * @example 'modelAttributeValue': {selector: 'CSSSelector', callback: Function}
		 * @example 'modelAttributeValue': {selector: 'CSSSelector', callback: 'function of this'}
		 * @example CSSSelector will be generated if autoBindings active. in this case, following selectors will be used:
		 * 				- [data-model="PROPERTYNAME"]
		 * 				- .PROPERTYNAME
		 * @callback {Mixed} Function(modelAttributes, propertyName, newValue) function will be executed in the scope of the view.
		 *																		if the function returns something and a selector is defined,
		 *																		then will be the return value used
		 */
		bindings:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		className:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Collection}
		 */
		collection:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * container element to append the view
		 *
		 * @var {jQuery}|{HTMLElement}|{String}
		 */
		container:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * All views have a DOM element at all times (the el property),
		 * whether they've already been inserted into the page or not.
		 * In this fashion, views can be rendered at any time, and inserted
		 * into the DOM all at once, in order to get high-performance UI
		 * rendering with as few reflows and repaints as possible. this.el
		 * is created from the view's tagName, className, id and attributes
		 * properties, if specified. If not, el is an empty div.
		 *
		 * @var {HTMLElement}
		 */
		el:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Object}
		 */
		events:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		id:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Layout}
		 */
		layout:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {Model}
		 */
		model:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._model;
			},
			set: function(model)
			{
				// stop previous model observer
				if (this.observer instanceof ObserverObject)
				{
					this.observer.unobserve();
					this.observer = null;
				}

				// this is a model and not null or so... create the observer
				if (model instanceof Model)
				{
					// create a observer?
					this.observer = new ObserverObject(model.attributes,
					{
						on:
						{
							set: this.onModelPropertyChange.bind(this)
						}
					});
				}

				if (model === null)
				{
					model = undefined;
				}

				this._model = model;
			}
		},

		/**
		 * @var {ObserverObject}
		 */
		observer:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * @var {String}
		 */
		tagName:
		{
			value: 'div',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * While templating for a view isn't a function provided directly by Backbone,
		 * it's often a nice convention to define a template function on your views.
		 * In this way, when rendering your view, you have convenient access to
		 * instance data. For example, using Underscore templates
		 *
		 * the result is always a template function
		 *
		 * @var {String}|{Function}
		 */
		template:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return this._template;
			},
			set: function(template)
			{
				if (template === null)
				{
					template = undefined;
				}

				if (template !== undefined && (template instanceof Function) === false)
				{
					template = lodash.template(template);
				}

				this._template = template;
			}
		},

		/**
		 * some template date which will be taken to render
		 *
		 * @var {Object}
		 */
		templateData:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * additional templates which will be automatic converted to function
		 *
		 * @var {Object}
		 */
		templates:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * handles the change of model attributes property change
	 *
	 * @param {jQuery.Event} event
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @param {Midex} newValue
	 * @returns {View}
	 */
	View.prototype.onModelPropertyChange = function(event, modelAttributes, propertyName, newValue)
	{
		var bindingOptions = this.bindings[propertyName];

		if (bindingOptions === undefined)
		{
			if (this.autoBindings !== true)
			{
				return this;
			}

			bindingOptions =
			{
				selector: '[data-model="' + propertyName + '"], .' + propertyName,
				callback: this['onChange' + propertyName.charAt(0).toUpperCase() + propertyName.slice(1)]
			};
		}


		// binding options entry is a string, convert it to object with selector
		if (typeof bindingOptions === 'string')
		{
			bindingOptions =
			{
				selector: bindingOptions
			};
		}
		// binding options entry is a function, convert it to object with callback
		else if (bindingOptions instanceof Function)
		{
			bindingOptions =
			{
				callback: bindingOptions
			};
		}

		var callbackResult = undefined;
		// in the options is a callback function as Function. call the function
		if (bindingOptions.callback instanceof Function)
		{
			callbackResult = bindingOptions.callback.call(this, modelAttributes, propertyName, newValue);
		}
		// in the options is a callback function as String. call the function from this
		else if (typeof bindingOptions.callback === 'string')
		{
			callbackResult = this[bindingOptions.callback](modelAttributes, propertyName, newValue);
		}

		// in the options is an selector define. find HTMLElement and update the html with the new value
		if (bindingOptions.selector !== undefined)
		{
			if (callbackResult !== undefined)
			{
				newValue = callbackResult;
			}
			this.$el.find(bindingOptions.selector).html(newValue);
		}

		return this;
	};

	/**
	 * close this view
	 *
	 * @returns {View}
	 */
	View.prototype.remove = function()
	{
		// remove class name
		if (this.className !== null)
		{
			this.$el.removeClass(this.className);
		}

		this.trigger('remove');

		Backbone.View.prototype.remove.apply(this, arguments);

		return this;
	};

	/**
	 * renders the template.
	 * all data from this function, templateData property and Model attributes property will be
	 * given to the template
	 *
	 * the data will be merge in following order from left to right
	 * - view property templateData
	 * - model attributes
	 * - function data
	 * all data are also available in data structure with following property names:
	 * 	- model: model attributes
	 * 	- template: view property templateData
	 * 	- data: function data
	 * 	- view: current view
	 *
	 * @param {Object} data
	 * @returns {View}
	 */
	View.prototype.render = function(data)
	{
		if (data === undefined)
		{
			data = {};
		}

		// add class name
		if (this.className !== null)
		{
			this.$el.addClass(this.className);
		}

		// nothing to do
		if ((this.template instanceof Function) === false)
		{
			return this;
		}

		// get model data if there is a model
		var dataModel = {};
		if (this.model instanceof Model)
		{
			dataModel = this.model.attributes;
		}

		// get template Data
		var dataTemplate = this.templateData;
		if ((dataTemplate instanceof Object) === false)
		{
			dataTemplate = {};
		}

		this.$el.html(this.template(lodash.extend(
		{
			model: dataModel,
			template: dataTemplate,
			data: data,
			view: this
		}, dataTemplate, dataModel, data)));

		// append to container
		if (this.container instanceof jQuery)
		{
			this.container.empty().append(this.$el);
		}

		return this;
	};

	/**
	 * @param {Object} other
	 * @param {String} event
	 * @param {Function} callback
	 * @returns {View}
	 */
	View.prototype.stopListening = function(other, event, callback)
	{
		if (this.observer instanceof ObserverObject)
		{
			this.observer.unobserve();
		}

		Backbone.View.prototype.stopListening.apply(this, arguments);

		return this;
	};

	/**
	 * translate text
	 *
	 * @param {String}
	 * @returns {String}
	 */
	View.prototype.translate = function(text)
	{
		return DI.get('translation').translate(text);
	};

	return View;
});
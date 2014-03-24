'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/observer/object',
	'forge/backbone/compatibility',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	ObserverObject,
	compatibility,
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
	 * @event {void} remove({View} view)
	 * @event {void} modelPropertyChange({View} view, {Model} model, {String} propertyName, {Mixed} newValue)
	 * @event {void} modelPropertyChange[:PROPERTYNAME]({View} view, {Model} model, {String} propertyName, {Mixed} newValue)
	 * @eventMethodObject onModelPropertyChange({String} propertyName, {Mixed} newValue)
	 * @eventMethodObject onModelPropertyChange[:PROPERTYNAME]({Mixed} newValue)
	 *
	 * @event {void} htmlPropertyChange({View} view, {Model} model, {String} propertyName, {Mixed} newValue)
	 * @event {void} htmlPropertyChange[:PROPERTYNAME]({View} view, {Model} model, {String} propertyName, {Mixed} newValue)
	 * @eventMethodObject onHTMLPropertyChange({String} propertyName, {Mixed} newValue)
	 * @eventMethodObject onHTMLPropertyChange[:PROPERTYNAME]({Mixed} newValue)
	 *
	 * @param {Object} options
	 * @returns {View}
	 */
	var View = function(options)
	{
		// read set model to view.. in start mode, backbone made strange things with prototype :( and so we have the initial event binding and fetching here
		if (this.model instanceof Model)
		{
			this.model = this.model;
		}

		options = options || {};

		// defaults modelBindings object
		if (this.modelBindings === null)
		{
			this.modelBindings = {};
		}

		// model formatters
		if (this.formatter === null)
		{
			this.formatter = {};
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

		// convert additional templates to template function and structur
		for (var key in this.templates)
		{
			if (typeof this.templates[key] === 'string' || this.templates[key] instanceof Function)
			{
				this.templates[key] =
				{
					template: this.templates[key]
				};
			}

			this.templates[key] = lodash.defaults(this.templates[key],
			{
				template: undefined,
				selector: undefined
			});

			if (typeof this.templates[key].template === 'string')
			{
				this.templates[key].template = lodash.template(this.templates[key].template);
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
		 * bind all model attributes keys, which are not defined in this.modelBindings
		 * the selector is '.KEYNAME'
		 * it will be also tested for a callback function "onChange" + PropertyName on the view
		 *
		 * @example propertyName = 'nuff'
		 *			selector = '.nuff'
		 *			callback = 'onChangeNuff'
		 *
		 * @var {Boolean}
		 */
		autoModelBindings:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * automatic save from inputs to model
		 *
		 * @var {Boolean}
		 */
		autoModelSave:
		{
			value: true,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * automatic update from inputs to model
		 *
		 * @var {Boolean}
		 */
		autoModelUpdate:
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
		 * append templates automatic to main template. works only if a template is defined
		 *
		 * @var {Boolean}
		 */
		autoTemplatesAppend:
		{
			value: true,
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
		 * object of model properties to format
		 * @example 'modelAttributeValue': {get: (Function | 'function of this'), set: (Function | 'function of this')}
		 * @see View::modelBindings
		 */
		formatter:
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
				if (this._model instanceof Model && this._modelObserverHandler instanceof Function)
				{
					this._model.observer.off('set', this._modelObserverHandler);
					this._modelObserverHandler = undefined;
				}

				// this is a model and not null or so... create the observer
				if (model instanceof Model)
				{
					// create a observer?
					this._modelObserverHandler = this.onModelPropertyChangeHandler.bind(this);
					model.observer.on('set', this._modelObserverHandler);
				}

				if (model === null)
				{
					model = undefined;
				}

				this._model = model;
			}
		},

		/**
		 * modelBindings for Model properties to given selector
		 *
		 * @var {Object}
		 * @example 'modelAttributeValue': 'CSSSelector' for parent containers
		 * @example 'modelAttributeValue': Function
		 * @example 'modelAttributeValue': {selector: 'CSSSelector', callback: (Function | 'function of this'), formatter: (Function | 'function of this')} <- formatter will be used as getter only
		 * @example 'modelAttributeValue': {selector: 'CSSSelector', callback: (Function | 'function of this'), formatter: {get: (Function | 'function of this'), set: (Function | 'function of this')}}
		 * @example CSSSelector will be generated if autoBindings active. in this case, following selectors will be used:
		 * 				- [data-model="PROPERTYNAME"]
		 * @callback {Mixed} Function(newValue, modelAttributes, propertyName) function will be executed in the scope of the view.
		 *																		if the function returns something and a selector is defined,
		 *																		then will be the return value used
		 * @formatter {Mixed} Function(value, modelAttributes, propertyName) function will be executed in the scope of the view. If the function returns undefined, the original value will be used
		 */
		modelBindings:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * returns the selector for data model elements for this view
		 *
		 * @returns {String}
		 */
		selectorDataModel:
		{
			enumerable: true,
			configurable: true,
			get: function()
			{
				return '[data-model-view-' + this.cid + ']';
			}
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
		 * @structure {key: { template: {String}|{Function}, selector: {String}|{jQuery}|{HTMLElement} }
		 * @var {Object}|{String}|{Function}
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
		},

		/**
		 * template for saving
		 *
		 * @var {String}
		 */
		templateSaving:
		{
			value: '<i class="fa fa-spinner fa-spin"></i>',
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * creates selectors for elements with different functions call to set a value
	 *
	 * @param {String} propertyName
	 * @param {String} selector
	 * @returns {Object}
	 */
	View.prototype.createSelectorForPropertyChange = function(propertyName, selector)
	{
		var fnPrefix = (function(selectorDataModel, value, selector)
		{
			return (value !== '' ? ',' : '') + selector.trimRight() + ' ' + selectorDataModel;
		}).bind(this, this.selectorDataModel.slice(0, -1) + '="' + propertyName + '"]');

		return lodash.reduce(selector.split(','), function(result, selector)
		{
			result.html.selector += fnPrefix(result.html.selector, selector) + ':not(:input)';
			result.val.selector += fnPrefix(result.val.selector, selector) + ':input'
									+ ':not([type=radio])'
									+ ':not([type=checkbox])'
									+ ':not([type=file])'
									+ ':not([type=date])'
									+ ':not([type=time])'
									+ ':not([type=datetime-local])'
									+ ':not([type=datetime])'
			;

			result.dateTime.selector += fnPrefix(result.dateTime.selector, selector) + ':input[type=date]';
			result.dateTime.selector += fnPrefix(result.dateTime.selector, selector) + ':input[type=time]';
			result.dateTime.selector += fnPrefix(result.dateTime.selector, selector) + ':input[type=datetime-local]';

			result.radio.selector += fnPrefix(result.radio.selector, selector) + '[type=radio]';
			result.checkbox.selector += fnPrefix(result.checkbox.selector, selector) + '[type=checkbox]';

			return result;
		},
		{
			html:
			{
				selector: '',
				callback: function(view, elements, newValue, newValueFormatted)
				{
					elements.html(newValueFormatted);
				}
			},
			val:
			{
				selector: '',
				callback: function(view, elements, newValue, newValueFormatted)
				{
					if (elements.is('[type=number]') === true)
					{
						elements.val(newValue);
					}
					else
					{
						elements.val(newValueFormatted);
					}
				}
			},
			radio:
			{
				selector: '',
				callback: function(view, elements, newValue, newValueFormatted)
				{
					elements.val([newValue]);
				}
			},
			checkbox:
			{
				selector: '',
				callback: function(view, elements, newValue, newValueFormatted)
				{
					elements.prop('checked', newValue);
				}
			},
			dateTime:
			{
				selector: '',
				callback: function(view, elements, newValue, newValueFormatted)
				{
					switch (true)
					{
						case (newValue instanceof Date && elements.is('[type=date]') === true):
						case (newValue instanceof Date && elements.is('[type=time]') === true):
						case (newValue instanceof Date && elements.is('[type=datetime-local]') === true):
						case (newValue instanceof Date && elements.is('[type=datetime]') === true):
							elements.prop('valueAsDate', newValue)
							break;

						default:
							elements.val(newValueFormatted);
							break;
					}
				}
			}
		}, this);
	};

	/**
	 * formattes given model Property and return the result
	 *
	 * @param {String} propertyName
	 * @param {Mixed} value
	 * @param {String} method can be one of the formatter methods default is 'get'
	 * @returns {Mixed}
	 */
	View.prototype.formatModelProperty = function(propertyName, value, method)
	{
		method = method || 'get';

		// find bindings options
		var bindingOption = this.modelBindings[propertyName];
		if (bindingOption === undefined)
		{
			return value;
		}

		// get the callback
		var callback = bindingOption.formatter[method];
		if ((callback instanceof Function) === false)
		{
			throw new Error('Invalid formatter method name "' + method + '" for model property "' + propertyName + '".');
		}

		// format the value
		var valueFormatted = callback.call(this, value, this.model.attributes, propertyName);
		if (valueFormatted === undefined)
		{
			return value;
		}

		return valueFormatted;
	};

	/**
	 * formatter for date
	 *
	 * @param {Date} value
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @returns {String}
	 */
	View.prototype.formatterDate = function(value, modelAttributes, propertyName)
	{
		if (value instanceof Date)
		{
			return value.toLocaleDateString();
		}

		return value;
	};

	/**
	 * formatter for date time
	 *
	 * @param {Date} value
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @returns {String}
	 */
	View.prototype.formatterDateTime = function(value, modelAttributes, propertyName)
	{
		if (value instanceof Date)
		{
			return value.toLocaleString();
		}

		return value;
	};

	/**
	 * formatter for numbers
	 *
	 * @param {Date} value
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @returns {String}
	 */
	View.prototype.formatterNumber = function(value, modelAttributes, propertyName)
	{
		if (typeof value === 'number')
		{
			return value.toLocaleString();
		}

		return value;
	};

	/**
	 * formatter for time
	 *
	 * @param {Date} value
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @returns {String}
	 */
	View.prototype.formatterTime = function(value, modelAttributes, propertyName)
	{
		if (value instanceof Date)
		{
			return value.toLocaleTimeString();
		}

		return value;
	};

	/**
	 * returns a get formatter
	 *
	 * @param {String} propertyName
	 * @param {String}|{Function}
	 * @returns {Function}
	 */
	View.prototype.getFormatterFunctionGet = function(propertyName, getOption)
	{
		var formatter = getOption;

		// formatter getter is a string, use function from this
		if (typeof formatter === 'string')
		{
			formatter = this[formatter];
		}

		// formatter getter is a string, use function from this
		if ((formatter instanceof Function) === false)
		{
			switch (this.model.attributeTypes[propertyName])
			{
				case Model.ATTRIBUTE_TYPE_NUMBER:
					formatter = this.formatterNumber;
					break;

				case Model.ATTRIBUTE_TYPE_DATE:
					formatter = this.formatterDate;
					break;
			}
		}

		// formatter getter not a function
		if ((formatter instanceof Function) === false)
		{
			formatter = lodash.noop;
		}

		return formatter;
	};

	/**
	 * returns a set formatter
	 *
	 * @param {String}|{Function}
	 * @returns {Function}
	 */
	View.prototype.getFormatterFunctionSet = function(propertyName, setOption)
	{
		var formatter = setOption;

		// formatter setter is a string, use function from this
		if (typeof formatter === 'string')
		{
			formatter = this[formatter];
		}

		// formatter getter not a function
		if ((formatter instanceof Function) === false)
		{
			formatter = lodash.noop;
		}

		return formatter;
	};

	/**
	 * formattes all model Properties and return the result
	 *
	 * @returns {Object}
	 */
	View.prototype.getFormattedModelProperties = function()
	{
		if ((this.model instanceof Model) === false)
		{
			return {};
		}

		return lodash.reduce(this.modelBindings, function(dataModel, bindingOption, propertyName)
		{
			dataModel[propertyName] = this.formatModelProperty(propertyName, dataModel[propertyName], 'get');
			return dataModel;
		}, lodash.clone(this.model.attributes), this);
	};

	/**
	 * hide last show saving
	 *
	 * @returns {View}
	 */
	View.prototype.hideSaving = function()
	{
		if (this._elementCurrentSaving !== undefined)
		{
			this._elementCurrentSaving.saving.remove();
			this._elementCurrentSaving.element.removeClass('data-model-saving');
			delete this._elementCurrentSaving;
		}

		return this;
	};

	/**
	 * replace current html with  html to element of view
	 * this function is needed so that other can overload and "translate"
	 *
	 * @param {String} html
	 * @returns {View}
	 */
	View.prototype.html = function(html)
	{
		this.$el.html(html);

		return this;
	};

	/**
	 * append html to element of view
	 * this function is needed so that other can overload and "translate"
	 *
	 * @param {String} html
	 * @param {String}|{jQuery}|{HTMLElement} selector
	 * @returns {View}
	 */
	View.prototype.htmlAppend = function(html, selector)
	{
		var element = undefined;
		if (selector !== null && selector !== undefined)
		{
			element = jQuery(selector);
		}

		if (element === null || element === undefined || element.length === 0)
		{
			element = this.$el;
		}

		element.append(html);

		return this;
	};

	/**
	 * initialize
	 *
	 * @param {Object} options
	 * @returns {View}
	 */
	View.prototype.initialize = function(options)
	{
		Backbone.View.prototype.initialize.apply(this, arguments);

		// prepare modelBindings
		if (this.model instanceof Model)
		{
			lodash.each(this.model.attributes, function(value, propertyName)
			{
				var bindingOptions = this.modelBindings[propertyName];

				// no auto
				if (bindingOptions === undefined && this.autoModelBindings !== true)
				{
					return this;
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
				// no data
				else if (bindingOptions === undefined || bindingOptions === null)
				{
					bindingOptions =
					{
						selector: '',
						callback: this['onChange' + propertyName.charAt(0).toUpperCase() + propertyName.slice(1)]
					};
				}

				// prepare callback
				// in the options is a callback function as String. call the function from this
				if (typeof bindingOptions.callback === 'string')
				{
					bindingOptions.callback = this[bindingOptions.callback];
				}
				// not a function
				if ((bindingOptions.callback instanceof Function) === false)
				{
					bindingOptions.callback = lodash.noop;
				}

				// formatter options of view overwrites formatter settings in modelBindings
				if (this.formatter[propertyName] !== undefined)
				{
					bindingOptions.formatter = this.formatter[propertyName];
				}
				// formatter
				if (bindingOptions.formatter === undefined)
				{
					bindingOptions.formatter = {};
				}
				// convert formatter settings to getter only
				if (typeof bindingOptions.formatter !== 'object')
				{
					bindingOptions.formatter =
					{
						get: bindingOptions.formatter
					};
				}

				// formatter
				bindingOptions.formatter.get = this.getFormatterFunctionGet(propertyName, bindingOptions.formatter.get);
				bindingOptions.formatter.set = this.getFormatterFunctionSet(propertyName, bindingOptions.formatter.set);

				// in the options is an selector define. find HTMLElement and update the html with the new value
				if (bindingOptions.selector !== undefined)
				{
					// create specific selectors
					bindingOptions.selectors = this.createSelectorForPropertyChange(propertyName, bindingOptions.selector);
				}

				// set preprare modelBindings
				this.modelBindings[propertyName] = bindingOptions;
			}, this);
		}

		return this;
	};

	/**
	 * on html property change
	 *
	 * @param {String} propertyName
	 * @param {Mixed} newValue
	 * @returns {View}
	 */
	View.prototype.onHTMLPropertyChange = function(propertyName, newValue)
	{
		return this;
	};

	/**
	 * if a HTMLElement change his value for a model property
	 *
	 * @param {jQuery.Event}
	 * @returns {View}
	 */
	View.prototype.onHTMLElementPropertyChangeHandler = function(event)
	{
		// find element and property
		var element = jQuery(event.target);
		var propertyName = element.data('model');

		// no property nothing to do
		if (propertyName === undefined)
		{
			return this;
		}

		// find bindingOptions
		var bindingOptions = this.modelBindings[propertyName];
		// nothing to do
		if (bindingOptions === undefined)
		{
			return this;
		}

		// no model nothing to do
		if ((this.model instanceof Model) === false)
		{
			return this;
		}

		// stop event, we can update the model
		event.stop();

		// get the value from property
		var newValue = undefined;

		// input is checkbox
		if (element.is(':checkbox') === true)
		{
			newValue = element.prop('checked');
		}
		// input is radio element
		else if (element.is(':radio') === true)
		{
			newValue = this.$el.find('[name=' + element.attr('name') + ']:checked').val();
		}
		// input is number element
		else if (element.is('[type=number]') === true)
		{
			newValue = element.prop('valueAsNumber');
		}
		// input is date element
		else if (element.is('[type=date]') === true || element.is('[type=time]') === true || element.is('[type=datetime-local]') === true || element.is('[type=datetime]') === true)
		{
			newValue = element.prop('valueAsDate');
		}
		// other inputs
		else
		{
			newValue = element.val();
		}

		// format the value
		newValue = this.formatModelProperty(propertyName, newValue, 'set');

		// set it
		var methodToSet = 'set';
		// save it
		if (this.autoModelSave === true)
		{
			methodToSet = 'save';
		}

		// show saving
		this.showSaving(element);

		// set the new value to model and set or save
		this.model[methodToSet](propertyName, newValue,
		{
			// TODO modelPropertyChange events and Functions onComplete
			complete: (function()
			{
				var propertyNameUcFirst = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

				// trigger event for property
				this.trigger('htmlPropertyChange:' + propertyNameUcFirst, this, this.model, propertyName, newValue);

				// method for property
				if (this['onHTMLPropertyChange' + propertyNameUcFirst] instanceof Function)
				{
					this['onHTMLPropertyChange' + propertyNameUcFirst](newValue);
				}

				// trigger event
				this.trigger('htmlPropertyChange', this, this.model, propertyName, newValue);

				// method for property
				this.onHTMLPropertyChange(propertyName, newValue);

				this.hideSaving();
			}).bind(this)
		});

		return this;
	};

	/**
	 * on model property change
	 *
	 * @param {String} propertyName
	 * @param {Mixed} newValue
	 * @returns {View}
	 */
	View.prototype.onModelPropertyChange = function(propertyName, newValue)
	{
		return this;
	};

	/**
	 * handles the change of model attributes property change
	 *
	 * @param {jQuery.Event} event
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @param {Midex} newValue
	 * @returns {View}
	 */
	View.prototype.onModelPropertyChangeHandler = function(event, modelAttributes, propertyName, newValue)
	{
		var bindingOptions = this.modelBindings[propertyName];

		// nothing to do
		if (bindingOptions === undefined)
		{
			return this;
		}

		// in the options is a callback function as Function. call the function
		var callbackResult = bindingOptions.callback.call(this, newValue, modelAttributes, propertyName);
		if (callbackResult !== undefined)
		{
			newValue = callbackResult;
		}

		// set in the html
		this.updateModelPropertyInHtml(propertyName, newValue);

		var propertyNameUcFirst = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

		// trigger event for property
		this.trigger('modelPropertyChange:' + propertyNameUcFirst, this, this.model, propertyName, newValue);

		// method for property
		if (this['onModelPropertyChange' + propertyNameUcFirst] instanceof Function)
		{
			this['onModelPropertyChange' + propertyNameUcFirst](newValue);
		}

		// trigger event
		this.trigger('modelPropertyChange', this, this.model, propertyName, newValue);

		// method for property
		this.onModelPropertyChange(propertyName, newValue);

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

		this.trigger('remove', this);

		if (this.$el.attr('id') === 'content')
		{
			this.$el.html('');
		}
		else
		{
			this.$el.remove();
		}

		this.stopListening();

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

		// append to container
		if (this.container instanceof jQuery)
		{
			this.container.empty().append(this.$el);
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
		var dataModel = this.getFormattedModelProperties();

		// get template Data
		var dataTemplate = this.templateData;
		if ((dataTemplate instanceof Object) === false)
		{
			dataTemplate = {};
		}

		// create data for template
		var dataComplete = lodash.extend(
		{
			model: dataModel,
			template: dataTemplate,
			data: data,
			view: this
		}, dataTemplate, dataModel, data);

		// set the html
		this.html(this.template(dataComplete));

		// auto append templates
		if (this.autoTemplatesAppend === true)
		{
			lodash.each(this.templates, function(template)
			{
				if (template.template instanceof Function)
				{
					this.htmlAppend(template.template(dataComplete), template.selector);
				}
			}, this);
		}

		// remap to unique view selector
		lodash.each(this.$el.find('[data-model]'), function(element)
		{
			element = jQuery(element);
			element.attr(this.selectorDataModel.slice(1, -1), element.data('model'));
		}, this);

		// create observing of inputs for observed modelBindings
		if (this.autoModelUpdate === true)
		{
			this.$el.find(this.selectorDataModel + ':input').on('change.model', this.onHTMLElementPropertyChangeHandler.bind(this));
		}

		// fill in the model data into template
		this.updateModelPropertiesToHtml();

		return this;
	};

	/**
	 * show saving
	 *
	 * @param {jQuery}|{HTMLElement} element
	 * @returns {View}
	 */
	View.prototype.showSaving = function(element)
	{
		this.hideSaving();

		element = jQuery(element);
		this._elementCurrentSaving =
		{
			element: element.addClass('data-model-saving'),
			saving: jQuery(this.templateSaving).insertAfter(element)
		};

		return this;
	};

	/**
	 * show saving on model property value manuel
	 *
	 * @param {String} propertyName
	 * @returns {View}
	 */
	View.prototype.showSavingModelProperty = function(propertyName)
	{
		var bindingOptions = this.modelBindings[propertyName];

		// nothing to do
		if (bindingOptions === undefined)
		{
			return this;
		}

		return this.showSaving(lodash.reduce(bindingOptions.selectors, function(acc, options)
		{
			return acc + (acc !== '' ? ', ' : '') + options.selector;
		}, ''));
	};

	/**
	 * @param {Object} other
	 * @param {String} event
	 * @param {Function} callback
	 * @returns {View}
	 */
	View.prototype.stopListening = function(other, event, callback)
	{
		// stop previous model observer
		if (this.model instanceof Model && this._modelObserverHandler instanceof Function)
		{
			this.model.observer.off('set', this._modelObserverHandler);
			this._modelObserverHandler = undefined;
		}

		this.undelegateEvents();
		Backbone.View.prototype.stopListening.apply(this, arguments);

		return this;
	};

	/**
	 * updates all binded model property in html
	 *
	 * @returns {View}
	 */
	View.prototype.updateModelPropertiesToHtml = function()
	{
		if ((this.model instanceof Model) === false)
		{
			return this;
		}

		lodash.each(this.modelBindings, function(bindingOption, propertyName)
		{
			this.updateModelPropertyInHtml(propertyName, this.model.attributes[propertyName]);
		}, this);

		return this;
	};

	/**
	 * updates a binded model property in html
	 *
	 * @param {String} propertyName
	 * @param {Mixed} value
	 * @returns {View}
	 */
	View.prototype.updateModelPropertyInHtml = function(propertyName, value)
	{
		var bindingOptions = this.modelBindings[propertyName];

		// nothing to do
		if (bindingOptions === undefined)
		{
			return this;
		}

		// format the value
		var valueFormatted = this.formatModelProperty(propertyName, value);

		// set on every selector the value
		lodash.each(bindingOptions.selectors, function(options)
		{
			var elements = this.$el.find(options.selector);

			if (elements.length === 0)
			{
				return;
			}

			// direct callback
			options.callback.call(this, this, elements, value, valueFormatted);
		}, this);

		return this;
	};

	return compatibility(View);
});

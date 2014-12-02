'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/backbone/compatibility',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	compatibility,
	Model
)
{
	/**
	 * returns a get formatter
	 *
	 * @param {View} view
	 * @param {Model} model
	 * @param {String} propertyName
	 * @param {String}|{Function} getOption
	 * @returns {Function}
	 */
	function getFormatterFunctionGet(view, model, propertyName, getOption)
	{
		var formatter = getOption;

		// formatter getter is a string, use function from this
		if (typeof formatter === 'string')
		{
			formatter = view[formatter];
		}

		// formatter getter is a string, use function from this
		if ((formatter instanceof Function) === false)
		{
			if (model.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_NUMBER)
			{
				formatter = view.formatterNumber;
			}
			else if (model.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_DATE)
			{
				formatter = view.formatterDate;
			}
			else if (model.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_DATETIME)
			{
				formatter = view.formatterDateTime;
			}
			else if (model.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_TIME)
			{
				formatter = view.formatterTime;
			}
		}

		// formatter getter not a function
		if ((formatter instanceof Function) === false)
		{
			formatter = undefined;
		}

		return formatter;
	}

	/**
	 * returns a set formatter for boolean
	 *
	 * @param {Mixed} value
	 * @returns {Boolean}
	 */
	function formatterDataTypeBoolean(value)
	{
		return !!value;
	}

	/**
	 * returns a set formatter for numbers
	 *
	 * @param {Mixed} value
	 * @returns {Number}
	 */
	function formatterDataTypeNumber(value)
	{
		if (typeof value === 'number')
		{
			return value;
		}
		return Number(value);
	}

	/**
	 * returns a set formatter
	 *
	 * @param {View} view
	 * @param {Model} model
	 * @param {String} propertyName
	 * @param {String}|{Function} setOption
	 * @returns {Function}
	 */
	function getFormatterFunctionSet(view, model, propertyName, setOption)
	{
		var formatter = setOption;

		// formatter setter is a string, use function from this
		if (typeof formatter === 'string')
		{
			formatter = view[formatter];
		}

		// formatter getter is a string, use function from this
		if ((formatter instanceof Function) === false)
		{
			if (model.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_NUMBER)
			{
				formatter = formatterDataTypeNumber;
			}
			else if (model.attributeTypes[propertyName] === Model.ATTRIBUTE_TYPE_BOOLEAN)
			{
				formatter = formatterDataTypeBoolean;
			}
		}

		// formatter getter not a function
		if ((formatter instanceof Function) === false)
		{
			formatter = undefined;
		}

		return formatter;
	}

	/**
	 * @param {View} view
	 * @param {Element} element
	 * @param {Mixed} newValue
	 * @param {String} newValueFormatted
	 */
	function propertyChangeHandlerHtml(view, element, newValue, newValueFormatted)
	{
		element.innerHTML = newValueFormatted;
	}

	/**
	 * @param {View} view
	 * @param {Element} element
	 * @param {Mixed} newValue
	 * @param {String} newValueFormatted
	 */
	function propertyChangeHandlerInputWithValue(view, element, newValue, newValueFormatted)
	{
		if (newValue === undefined || newValue === null)
		{
			newValue = '';
		}

		if (newValueFormatted === undefined || newValueFormatted === null)
		{
			newValueFormatted = '';
		}

		if (element.type === 'number' || element.tagName.toLowerCase() === 'select' === true)
		{
			element.value = newValue;
		}
		else
		{
			element.value = newValueFormatted;
		}
	}

	/**
	 * @param {View} view
	 * @param {Element} element
	 * @param {Mixed} newValue
	 * @param {String} newValueFormatted
	 */
	function propertyChangeHandlerInputTypeRadio(view, element, newValue, newValueFormatted)
	{
		element.checked = (element.value == newValue);
	}

	/**
	 * @param {View} view
	 * @param {Element} element
	 * @param {Boolean} newValue
	 * @param {String} newValueFormatted
	 */
	function propertyChangeHandlerInputTypeCheckbox(view, element, newValue, newValueFormatted)
	{
		element.checked = newValue;
	}

	/**
	 * handles the model property value of type date to put in into an input[type=date], input[type=time], input[type=datetime]
	 *
	 * @param {View} view
	 * @param {Element} element
	 * @param {Date} newValue
	 * @param {String} newValueFormatted
	 */
	function propertyChangeHandlerInputTypeDateTime(view, element, newValue, newValueFormatted)
	{
		if (newValue === undefined || newValue === null)
		{
			newValue = '';
		}

		if (newValueFormatted === undefined || newValueFormatted === null)
		{
			newValueFormatted = '';
		}

		if (newValue instanceof Date && (element.type == 'date' || element.type == 'time' || element.type == 'datetime-local' || element.type == 'datetime'))
		{
			element.valueAsDate = newValue;
		}
		// fallback
		else
		{
			element.value = newValueFormatted;
		}
	}

	/**
	 * creates the prefix for "createSelectorForPropertyChange"
	 *
	 * @param {String} value
	 * @param {String} selector
	 * @param {String} selectorDataModel
	 * @returns {String}
	 */
	function createSelectorForPropertyChangePrefix(value, selector, selectorDataModel)
	{
		return (value !== '' ? ',' : '') + selector.trimRight() + ' ' + selectorDataModel;
	}

	/**
	 * creates selectors for elements with different functions call to set a value
	 *
	 * @param {View} view
	 * @param {String} propertyName
	 * @param {String} selector
	 * @returns {Object}
	 */
	function createSelectorForPropertyChange(view, propertyName, selector)
	{
		var selectorDataModel = '[' + view.selectorDataModelAttributeName + '="' + propertyName + '"]';
		var selectors = selector.split(',');
		var selectorsLength = selectors.length;
		var result  =
		{
			html:
			{
				selector: '',
				callback: propertyChangeHandlerHtml
			},
			val:
			{
				selector: '',
				callback: propertyChangeHandlerInputWithValue
			},
			radio:
			{
				selector: '',
				callback: propertyChangeHandlerInputTypeRadio
			},
			checkbox:
			{
				selector: '',
				callback: propertyChangeHandlerInputTypeCheckbox
			},
			dateTime:
			{
				selector: '',
				callback: propertyChangeHandlerInputTypeDateTime
			}
		};

		var i = undefined;
		var selector = undefined;
		for (i = 0; i < selectorsLength; i++)
		{
			selector = selectors[i];

			result.html.selector += createSelectorForPropertyChangePrefix(result.html.selector, selector, selectorDataModel) + ':not(input):not(textarea):not(select):not(button)';
			result.val.selector += createSelectorForPropertyChangePrefix(result.val.selector, selector, 'textarea' + selectorDataModel);
			result.val.selector += createSelectorForPropertyChangePrefix(result.val.selector, selector, 'select' + selectorDataModel);
			result.val.selector += createSelectorForPropertyChangePrefix(result.val.selector, selector, 'input' + selectorDataModel)
									+ ':not([type=radio])'
									+ ':not([type=checkbox])'
									+ ':not([type=file])'
									+ ':not([type=date])'
									+ ':not([type=time])'
									+ ':not([type=datetime-local])'
									+ ':not([type=datetime])'
			;

			result.dateTime.selector += createSelectorForPropertyChangePrefix(result.dateTime.selector, selector, 'input' + selectorDataModel) + '[type=date]';
			result.dateTime.selector += createSelectorForPropertyChangePrefix(result.dateTime.selector, selector, 'input' + selectorDataModel) + '[type=time]';
			result.dateTime.selector += createSelectorForPropertyChangePrefix(result.dateTime.selector, selector, 'input' + selectorDataModel) + '[type=datetime-local]';

			result.radio.selector += createSelectorForPropertyChangePrefix(result.radio.selector, selector, 'input' + selectorDataModel) + '[type=radio]';
			result.checkbox.selector += createSelectorForPropertyChangePrefix(result.checkbox.selector, selector, 'input' + selectorDataModel) + '[type=checkbox]';
		}

		return result;
	}

	/**
	 * @param {View} view
	 * @param {Model} model
	 * @param {String} propertyName
	 * @returns {Boolean}
	 */
	function createModelPropertyBindings(view, model, propertyName)
	{
		var bindingOptions = undefined;

		if (view.modelBindings !== undefined && view.modelBindings !== null)
		{
			bindingOptions = view.modelBindings[propertyName];
		};

		// no auto
		if (bindingOptions === undefined && view.autoModelBindings !== true)
		{
			return false;
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
				callback: view['onChange' + propertyName.charAt(0).toUpperCase() + propertyName.slice(1)]
			};
		}

		// prepare callback
		// in the options is a callback function as String. call the function from this
		if (typeof bindingOptions.callback === 'string')
		{
			bindingOptions.callback = view[bindingOptions.callback];
		}
		// not a function
		if ((bindingOptions.callback instanceof Function) === false)
		{
			bindingOptions.callback = lodash.noop;
		}

		// formatter options of view overwrites formatter settings in modelBindings
		if (view.formatter !== undefined && view.formatter !== null && view.formatter[propertyName] !== undefined)
		{
			bindingOptions.formatter = view.formatter[propertyName];
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
		bindingOptions.formatter.get = getFormatterFunctionGet(view, model, propertyName, bindingOptions.formatter.get);
		bindingOptions.formatter.set = getFormatterFunctionSet(view, model, propertyName, bindingOptions.formatter.set);

		// in the options is an selector define. find Element and update the html with the new value
		if (bindingOptions.selector !== undefined)
		{
			// create specific selectors
			bindingOptions.selectors = createSelectorForPropertyChange(view, propertyName, bindingOptions.selector);
		}

		// set preprare modelBindings
		view.modelBindings[propertyName] = bindingOptions;

		// bind property to observer
		model.observer.on('set:' + propertyName, function(modelAttributes, propertyNameFromCallback, newValue, oldValue)
		{
			onModelPropertyChangeHandler(view, modelAttributes, propertyNameFromCallback, newValue, oldValue);
		}, view);

		return true;
	}

	/**
	 * formattes given model Property and return the result
	 *
	 * @param {View} view
	 * @param {String} propertyName
	 * @param {Mixed} value
	 * @param {String} method can be one of the formatter methods 'get' or 'set'
	 * @returns {Mixed}
	 */
	function formatModelProperty(view, propertyName, value, method)
	{
		// find bindings options
		var bindingOption = view.modelBindings[propertyName];
		if (bindingOption === undefined)
		{
			return value;
		}

		// get the callback
		var callback = bindingOption.formatter[method];
		if (callback === undefined)
		{
			return value;
		}

		if ((callback instanceof Function) === false)
		{
			throw new Error('Invalid formatter method name "' + method + '" for model property "' + propertyName + '".');
		}

		// format the value
		var valueFormatted = callback.call(view, value, view.model.attributes, propertyName);
		if (valueFormatted === undefined)
		{
			return value;
		}

		return valueFormatted;
	}

	/**
	 * formattes all model Properties and return the result
	 *
	 * @param {View} view
	 * @returns {Object}
	 */
	function getFormattedModelProperties(view)
	{
		var result = {};
		if ((view.model instanceof Model) === false)
		{
			return result;
		}

		var propertyName = undefined;
		for (propertyName in view.modelBindings)
		{
			result[propertyName] = formatModelProperty(view, propertyName, view.model.attributes[propertyName], 'get');
		}

		return result;
	}

	/**
	 * if a Element change his value for a model property
	 *
	 * @param {View} view
	 * @param {Event} event
	 */
	function onHtmlElementPropertyChangeHandler(view, event)
	{
		// find element and property
		var element = event.target;
		var propertyName = element.getAttribute('data-model');

		// no property nothing to do
		if (propertyName === undefined)
		{
			return;
		}

		// find bindingOptions
		var bindingOptions = view.modelBindings[propertyName];
		// nothing to do
		if (bindingOptions === undefined)
		{
			return;
		}

		// no model nothing to do
		if ((view.model instanceof Model) === false)
		{
			return;
		}

		// get the value from property
		var newValue = undefined;

		// input is checkbox
		if (element.type == 'checkbox')
		{
			newValue = !!element.checked;
		}
		// input is radio element
		else if (element.type == 'radio')
		{
			newValue = view.el.querySelector('[name=' + element.name + ']:checked').value;
		}
		// input is number element
		else if (element.type == 'number')
		{
			newValue = element.valueAsNumber;
		}
		// input is date element
		else if (element.type == 'date' || element.type == 'time' || element.type == 'datetime-local' || element.type == 'datetime')
		{
			newValue = element.valueAsDate;
		}
		// other inputs
		else
		{
			newValue = element.value;
		}

		// format the value
		newValue = formatModelProperty(view, propertyName, newValue, 'set');
		var oldValue = view.model.attributes[propertyName];

		// set it
		var methodToSet = 'set';
		// save it
		if (view.autoModelSave === true)
		{
			methodToSet = 'save';
		}

		// show saving
		view.showSaving(element);

		// set the new value to model and set or save
		view.model[methodToSet](propertyName, newValue,
		{
			complete: function()
			{
				var propertyNameUcFirst = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

				// trigger event for property
				view.trigger('htmlPropertyChange:' + propertyNameUcFirst, newValue, oldValue);

				// method for property
				if (view['onHtmlPropertyChange' + propertyNameUcFirst] instanceof Function)
				{
					view['onHtmlPropertyChange' + propertyNameUcFirst](newValue, oldValue);
				}

				// trigger event
				view.trigger('htmlPropertyChange', view, view.model, propertyName, newValue, oldValue);

				// method for
				if (view.onHtmlPropertyChange instanceof Function)
				{
					view.onHtmlPropertyChange(view, view.model, propertyName, newValue, oldValue);
				}

				view.hideSaving();
			}
		});
	}

	/**
	 * updates a binded model property in html
	 *
	 * @param {View} view
	 * @param {String} propertyName
	 * @param {Mixed} value
	 */
	function updateModelPropertyInHtml(view, propertyName, value)
	{
		var bindingOptions = view.modelBindings[propertyName];

		// nothing to do
		if (bindingOptions === undefined)
		{
			return;
		}

		// format the value
		var valueFormatted = formatModelProperty(view, propertyName, value, 'get');

		// set on every selector the value
		var selectorType = undefined;
		var options = undefined;
		var elements = undefined;
		var i = undefined;
		var length = undefined;

		for (selectorType in bindingOptions.selectors)
		{
			options = bindingOptions.selectors[selectorType];
			elements = view.el.querySelectorAll(options.selector);
			if (elements.length === 0)
			{
				continue;
			}

			// direct callback
			for (i = 0, length = elements.length; i < length; i++)
			{
				options.callback.call(view, view, elements[i], value, valueFormatted);
			}
		};
	}

	/**
	 * handles the change of model attributes property change
	 *
	 * @param {View} view
	 * @param {Object} modelAttributes
	 * @param {String} propertyName
	 * @param {Midex} newValue
	 * @param {Midex} oldValue
	 */
	function onModelPropertyChangeHandler(view, modelAttributes, propertyName, newValue, oldValue)
	{
		var bindingOptions = view.modelBindings[propertyName];

		// nothing to do
		if (bindingOptions === undefined)
		{
			return;
		}

		// nothing changed, nothing to do
		if (newValue === oldValue)
		{
			return;
		}

		// in the options is a callback function as Function. call the function
		var callbackResult = bindingOptions.callback.call(view, newValue, modelAttributes, propertyName);
		if (callbackResult !== undefined)
		{
			newValue = callbackResult;
		}

		// set in the html
		updateModelPropertyInHtml(view, propertyName, newValue);

		var propertyNameUcFirst = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

		// trigger event for property
		view.trigger('modelPropertyChange:' + propertyNameUcFirst, view, view.model, propertyName, newValue, oldValue);

		// method for property
		if (view['onModelPropertyChange' + propertyNameUcFirst] instanceof Function)
		{
			view['onModelPropertyChange' + propertyNameUcFirst](newValue, oldValue);
		}

		// trigger event
		view.trigger('modelPropertyChange', view, view.model, propertyName, newValue);

		// method for property
		view.onModelPropertyChange(propertyName, newValue, oldValue);
	}

	/**
	 * updates all binded model property in html
	 *
	 * @param {View} view
	 */
	function updateModelPropertiesToHtml(view)
	{
		if ((view.model instanceof Model) === false)
		{
			return;
		}

		var propertyName = undefined;
		for (propertyName in view.modelBindings)
		{
			updateModelPropertyInHtml(view, propertyName, view.model.attributes[propertyName]);
		}
	}

	// ############################################################################# View

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
	 * @event {void} modelPropertyChange({View} view, {Model} model, {String} propertyName, {Mixed} newValue, {Mixed} oldValue)
	 * @event {void} modelPropertyChange[:PROPERTYNAME]({Mixed} newValue, {Mixed} oldValue)
	 * @eventMethodObject onModelPropertyChange({String} propertyName, {Mixed} newValue, {Mixed} oldValue)
	 * @eventMethodObject onModelPropertyChange[:PROPERTYNAME]({Mixed} newValue, {Mixed} oldValue)
	 *
	 * @event {void} htmlPropertyChange({View} view, {Model} model, {String} propertyName, {Mixed} newValue, {Mixed} oldValue)
	 * @event {void} htmlPropertyChange[:PROPERTYNAME]({Mixed} newValue, {Mixed} oldValue)
	 * @eventMethodObject onHtmlPropertyChange({View} view, {Model} model, {String} propertyName, {Mixed} newValue, {Mixed} oldValue)
	 * @eventMethodObject onHtmlPropertyChange[:PROPERTYNAME]({Mixed} newValue, {Mixed} oldValue)
	 *
	 * @param {Object} options
	 */
	function View(options)
	{
		this.selectorDataModelAttributeName = 'data-model-view-' + lodash.uniqueId();
		this.selectorDataModel = '[' + this.selectorDataModelAttributeName + ']';

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

		// bind events
		if (options.on !== undefined)
		{
			this.on(options.on);
			delete options.on;
		}

		// bind events
		if (options.once !== undefined)
		{
			this.once(options.once);
			delete options.once;
		}

		// copy options
		var key = undefined;
		for (key in options)
		{
			if (excludeProperties[key] === true)
			{
				continue;
			}
			if (this[key] !== undefined)
			{
				this[key] = options[key];
			}
		}

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
		if (typeof this.container === 'string')
		{
			this.container = document.querySelector(this.container);
		}

		// do pre init
		this.preInitialize(options);

		// parent
		Backbone.View.apply(this, arguments);

		// auto render?
		if (this.autoRender === true)
		{
			this.render();
		}
	}

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
		 * @var {Element}|{String}
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
		 * @var {Element}
		 */
		el:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * the parent node of element
		 *
		 * @var {Element}
		 */
		elParent:
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
				if (this.preInitialized === false)
				{
					this._model = model;
					return;
				}

				// only if autoModelBindings === true OR modelBindings contains entries
				var isInObservation = (this.autoModelBindings === true || Object.keys(this.modelBindings).length !== 0);

				// stop previous model observer
				if (isInObservation === true && this._model instanceof Model)
				{
					this._model.observer.off(undefined, undefined, this);
				}

				// this is a model and not null or so... create the observer
				if (isInObservation === true && model instanceof Model)
				{
					// prepare modelBindings
					var startObservation = false;
					for (var propertyName in model.attributeTypes)
					{
						// do not track properties of type COLLECTION
						// do not track properties of type MODEL
						if (model.attributeTypes[propertyName] !== Model.ATTRIBUTE_TYPE_COLLECTION && model.attributeTypes[propertyName] !== Model.ATTRIBUTE_TYPE_MODEL)
						{
							if (createModelPropertyBindings(this, model, propertyName) === true)
							{
								startObservation = true;
							}
						}
					}

					if (startObservation === true)
					{
						model.observer.observe();
					}
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
		 * little helper to indicate if all pre-initialized
		 *
		 * @var {Boolean}
		 */
		preInitialized:
		{
			value: false,
			enumerable: false,
			configurable: false,
			writable: true
		},

		/**
		 * returns the selector for data model elements for this view
		 *
		 * @returns {String}
		 */
		selectorDataModel:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * returns the attribute name for selector data model
		 *
		 * @returns {String}
		 */
		selectorDataModelAttributeName:
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
		 * template should be append and not replace the content of this.el
		 *
		 * @var {Boolean}
		 */
		templateAppend:
		{
			value: false,
			enumerable: true,
			configurable: true,
			writable: true
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
		 * @structure {key: { template: {String}|{Function}, selector: {String}|{Element} }
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

	// Cached regex to split keys for `delegate`.
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	/**
	 * appends more delegated events without removing previous added events
	 *
	 * @param {Object} options
	 * @returns {View}
	 */
	View.prototype.appendDelegateEvents = function(events)
	{
		for (var key in events)
		{
			var method = events[key];
			if ((method instanceof Function) === false)
			{
				method = this[events[key]];
			}
			if ((method instanceof Function) === false)
			{
				continue;
			}

			var match = key.match(delegateEventSplitter);
			var eventName = match[1];
			var selector = match[2];

			method = method.bind(this);
			eventName += '.delegateEvents' + this.cid;
			if (selector === '')
			{
				this.$el.on(eventName, method);
			}
			else
			{
				this.$el.on(eventName, selector, method);
			}
		}

		return this;
	};

	/**
	 * attach the view DOM Nodes
	 *
	 * @returns {View}
	 */
	View.prototype.attach = function()
	{
		if (this.el.parentNode !== null)
		{
			throw new Error('Can not attach the view to dom, because the view is located in the dom.');
		}

		if (this.elParent === null)
		{
			throw new Error('Can not attach the view to dom, because there is no parent element defined.');
		}

		this.parent.appendChild(this.el);

		return this;
	};

	/**
	 * detach the view DOM Nodes but do not destroy it for later use
	 *
	 * @returns {View}
	 */
	View.prototype.detach = function()
	{
		if (this.elParent === null)
		{
			throw new Error('Can not detach the view to dom, because the view is not located in the dom.');
		}

		this.elParent.removeChild(this.el);

		return this;
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

		return String(value);
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

		return String(value);
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

		return String(value);
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

		return String(value);
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
			this._elementCurrentSaving.saving.parentNode.removeChild(this._elementCurrentSaving.saving);
			this._elementCurrentSaving.element.classList.remove('data-model-saving');
			delete this._elementCurrentSaving;
		}

		return this;
	};

	/**
	 * replace current html with html to element of view
	 * this function is needed so that other can overload and "translate"
	 *
	 * @param {String} html
	 * @returns {View}
	 */
	View.prototype.html = function(html)
	{
		this.el.innerHTML = html;

		return this;
	};

	/**
	 * append html to element of view
	 * this function is needed so that other can overload and "translate"
	 *
	 * @param {String} html
	 * @param {String}|{Element} selector
	 * @returns {View}
	 */
	View.prototype.htmlAppend = function(html, selector)
	{
		var element = undefined;
		if (selector !== null && selector !== undefined)
		{
			element = document.querySelector(selector);
		}

		if (element === null || element === undefined || element.length === 0)
		{
			element = this.el;
		}

		element.insertAdjacentHTML('beforeEnd', html);

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
	 * initialize before calling backbone constructor
	 *
	 * @param options
	 * @returns {View}
	 */
	View.prototype.preInitialize = function(options)
	{
		if (this.preInitialized === true)
		{
			return this;
		}

		this.preInitialized = true;

		// read set model to view.. in start mode, backbone made strange things with prototype :( and so we have the initial event binding and fetching here
		if (this.model instanceof Object)
		{
			var modelToInsert = this.model;
			this.model = modelToInsert;
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
			this.el.classList.remove(this.className);
		}

		this.trigger('remove', this);

		if (this.el.id === 'content')
		{
			this.html('');
		}
		else if (this.el.parentNode !== null)
		{
			this.el.parentNode.removeChild(this.el);
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
		Backbone.View.prototype.render.call(this);

		if (data === undefined)
		{
			data = {};
		}

		// append to container
		if (this.container instanceof window.Element)
		{
			this.container.innerHTML = '';
			this.container.appendChild(this.el);
		}

		this.elParent = this.el.parentNode;

		// add class name
		if (this.className !== null)
		{
			this.el.classList.add(this.className);
		}

		// nothing to do
		if ((this.template instanceof Function) === false)
		{
			return this;
		}

		// get model data if there is a model
		var dataModelFormatted = getFormattedModelProperties(this);

		// get template Data
		var dataTemplate = this.templateData;
		if ((dataTemplate instanceof Object) === false)
		{
			dataTemplate = {};
		}

		// create data for template
		var dataComplete = lodash.extend(
		{
			modelFormatted: dataModelFormatted,
			model: this.model !== null && this.model !== undefined ? this.model.attributes : {},
			template: dataTemplate,
			data: data,
			view: this
		}, dataTemplate, dataModelFormatted, data);

		// get the html from template
		var templateAsHtml = this.template(dataComplete);

		// replace the html with content in element
		if (this.templateAppend === false)
		{
			this.html(templateAsHtml);
		}
		// append the html in element
		else
		{
			this.htmlAppend(templateAsHtml);
		}

		// auto append templates
		if (this.autoTemplatesAppend === true)
		{
			var templateKey = undefined;
			var template = undefined;
			for (templateKey in this.templates)
			{
				template = this.templates[templateKey];
				if (template.template instanceof Function)
				{
					this.htmlAppend(template.template(dataComplete), template.selector);
				}
			}
		}

		// remap to unique view selector
		this.renderRemapViewSelector();

		// create observing of inputs for observed modelBindings
		if (this.autoModelUpdate === true)
		{
			//var self = this;
			var elements = this.el.querySelectorAll('input' + this.selectorDataModel + ', textarea' + this.selectorDataModel + ', select' + this.selectorDataModel + ', button' + this.selectorDataModel);
			var changeEventHandlerCallback = onHtmlElementPropertyChangeHandler.bind(this, this);
			for (var i = 0, length = elements.length; i < length; i++)
			{
				elements[i].addEventListener('change', changeEventHandlerCallback);
			}
		}

		// fill in the model data into template
		updateModelPropertiesToHtml(this);

		return this;
	};

	/**
	 * remap to unique view selector
	 *
	 * @returns {View}
	 */
	View.prototype.renderRemapViewSelector = function()
	{
		var elementDataModels = this.el.querySelectorAll('[data-model]');
		var elementDataModelsLength = elementDataModels.length;
		var elementDataModel = undefined;
		var elementDataModelPropertyName = undefined;
		var modelAttributeTypes = this.model !== undefined && this.model !== null ? this.model.attributeTypes : undefined;
		var i = undefined;

		for (i = 0; i < elementDataModelsLength; i++)
		{
			elementDataModel = elementDataModels[i];

			elementDataModelPropertyName = elementDataModel.getAttribute('data-model');
			elementDataModel.setAttribute(this.selectorDataModelAttributeName, elementDataModelPropertyName);

			if (modelAttributeTypes !== undefined)
			{
				elementDataModel.setAttribute('data-type', modelAttributeTypes[elementDataModelPropertyName]);
			}
		}

		return this;
	};

	/**
	 * show saving
	 *
	 * @param {Element} element
	 * @returns {View}
	 */
	View.prototype.showSaving = function(element)
	{
		this.hideSaving();

		element.classList.add('data-model-saving');
		element.insertAdjacentHTML('afterEnd', this.templateSaving);

		this._elementCurrentSaving =
		{
			element: element,
			saving: element.nextSibling
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
		// only if autoModelBindings === true OR modelBindings contains entries
		var isInObservation = (this.autoModelBindings === true || Object.keys(this.modelBindings).length !== 0);

		// stop previous model observer
		if (isInObservation === true && this.model instanceof Model)
		{
			this.model.observer.off(undefined, undefined, this);
		}

		this.undelegateEvents();
		Backbone.View.prototype.stopListening.apply(this, arguments);

		return this;
	};

	return compatibility(View);
});

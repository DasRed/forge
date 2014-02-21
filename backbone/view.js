'use strict';

define(
[
	'lodash',
	'backbone',
	'forge/observer/object',
	'forge/backbone/model'
], function(
	lodash,
	Backbone,
	ObserverObject,
	Model
)
{
	/**
	 * View
	 *
	 * @param {Object} options
	 * @returns {View}
	 */
	var View = function(options)
	{
		this.bindings = {};
		this.events = {};

		Backbone.View.apply(this, arguments);

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
				if ((template instanceof Function) === false)
				{
					template = lodash.template(template);
				}

				this._template = template;
			}
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
				selector: '.' + propertyName,
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
		this.trigger('remove');

		Backbone.View.prototype.remove.apply(this, arguments);

		return this;
	};

	/**
	 * @returns {View}
	 */
	View.prototype.render = function()
	{
		var attributes = {};
		var template = this.template;

		// nothing to do
		if (template === undefined || template === null)
		{
			return this;
		}

		// get model data if there is a model
		if (this.model !== null)
		{
			attributes = this.model.attributes;
		}

		this.$el.html(template(attributes));

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

	return View;
});
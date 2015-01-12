'use strict';

define(
[
	'forge/backbone/compatibility',
	'forge/backbone/view/list/entry'
], function(
	compatibility,
	ViewListEntry
)
{
	/**
	 * A View for one entry in list selected
	 *
	 * @event {void} select({ViewListSelectEntry} viewEntry)
	 * @param {Object} options
	 */
	function ViewListSelectEntry(options)
	{
		ViewListEntry.apply(this, arguments);
	}

	// prototype
	ViewListSelectEntry.prototype = Object.create(ViewListEntry.prototype,
	{
		/**
		 * css class names for selected elements
		 *
		 * @var {String}
		 */
		classNameSelected:
		{
			value: 'selected',
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * list of events to handle for selections
		 *
		 * @var {Array}
		 */
		eventToSelect:
		{
			value:
			[
				'click',
				'tap'
			],
			enumerable: true,
			configureable: true,
			writable: true
		},

		/**
		 * css selector to select elements for eventToSelect binding
		 * if the value is null || undefined, this.el will be taken
		 *
		 * @var {String}
		 */
		selectorToSelect:
		{
			value: null,
			enumerable: true,
			configureable: true,
			writable: true
		}
	});

	/**
	 * returns true if the element is marked as selected. if not, false will be returned
	 *
	 * @returns {Boolean}
	 */
	ViewListSelectEntry.prototype.isMarkedAsSelected = function()
	{
		return this.el.classList.contains(this.classNameSelected);
	};

	/**
	 * mark as selected
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.markAsSelected = function()
	{
		this.el.classList.add(this.classNameSelected);

		return this;
	};

	/**
	 * mark as unselected
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.markAsUnselected = function()
	{
		this.el.classList.remove(this.classNameSelected);

		return this;
	};

	/**
	 * on Event to select
	 *
	 * @param {Event} event
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.onEventToSelect = function(event)
	{
		if (event.target.matches('input, textarea, select, button, a') === true)
		{
			return this;
		}

		return this.triggerSelect();
	};

	/**
	 * render
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.render = function()
	{
		ViewListEntry.prototype.render.apply(this, arguments);

		var element = this.selectorToSelect !== undefined && this.selectorToSelect !== null ? this.el.querySelector(this.selectorToSelect) : this.el;
		var callback = this.onEventToSelect.bind(this);

		for (var i = 0, length = this.eventToSelect.length; i < length; i++)
		{
			element.addEventListener(this.eventToSelect[i], callback);
		}

		this.el.setAttribute('data-model-cid', this.model.cid);

		return this;
	};

	/**
	 * on Event select
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.triggerSelect = function()
	{
		this.trigger('select', this);

		return this;
	};

	return compatibility(ViewListSelectEntry);
});
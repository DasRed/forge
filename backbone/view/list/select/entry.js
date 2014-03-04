'use strict';

define(
[
	'jQuery',
	'forge/backbone/compatibility',
	'forge/backbone/view/list/entry'
], function(
	jQuery,
	compatibility,
	ViewListEntry
)
{
	/**
	 * A View for one entry in list selected
	 *
	 * @event {void} select({ViewListSelectEntry} viewEntry)
	 * @param {Object} options
	 * @returns ViewListSelectEntry
	 */
	var ViewListSelectEntry = function(options)
	{
		ViewListEntry.apply(this, arguments);

		return this;
	};

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
		 * @var {String}
		 */
		eventToSelect:
		{
			value: 'click tap',
			enumerable: true,
			configureable: true,
			writable: true
		},

		/**
		 * css selector to select elements for eventToSelect binding
		 * if the value is null || undefined, this.$el will be taken
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
	 * mark as selected
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.markAsSelected = function()
	{
		this.$el.addClass(this.classNameSelected);

		return this;
	};

	/**
	 * mark as unselected
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.markAsUnselected = function()
	{
		this.$el.removeClass(this.classNameSelected);

		return this;
	};

	/**
	 * on Event to select
	 *
	 * @param {jQuery.Event} event
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.onEventToSelect = function(event)
	{
		if (jQuery(event.target).is(':input') === true)
		{
			return this;
		}

		event.stop();

		this.trigger('select', this);

		return this;
	};

	/**
	 * render
	 *
	 * @returns {ViewListSelectEntry}
	 */
	ViewListSelectEntry.prototype.render = function()
	{
		ViewListEntry.prototype.render.apply(this, arguments);

		var element = this.selectorToSelect !== undefined && this.selectorToSelect !== null ? this.$el.find(this.selectorToSelect) : this.$el;
		element.on(this.eventToSelect, this.onEventToSelect.bind(this));

		this.$el.data('modelCid', this.model.cid);

		return this;
	};

	return compatibility(ViewListSelectEntry);
});
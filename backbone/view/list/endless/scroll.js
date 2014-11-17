'use strict';

define(
[
	'jQuery',
	'lodash',
	'forge/object/base'
], function(
	jQuery,
	lodash,
	Base
)
{
	var elementWindow = jQuery(window);

	/**
	 * test if an element is in viewport or not
	 *
	 * @param {jQuery} element
	 * @param {Boolean} partial
	 * @returns {Boolean}
	 */
	function elementInViewport(element, partial)
	{
		element = element.eq(0);

		var viewTop = elementWindow.scrollTop();
		var viewBottom = viewTop + elementWindow.height();

		var top = element.offset().top;
		var bottom = top + element.height();

		var compareTop = partial === true ? bottom : top;
		var compareBottom = partial === true ? top : bottom;

		return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
	}

	/**
	 * Endless Scroll for List and Tables
	 *
	 * @param {Object} options
	 */
	function ViewListEndlessScroll(options)
	{
		this.cachedEntries = {};

		Base.call(this, options);

		// validate
		if (this.viewList === null || this.viewList === undefined)
		{
			throw new Error('The option viewList must be defined for endlessScrolling');
		}

		// backup original view list functions
		this.viewListFunctionRender = this.viewList.render;
		this.viewListFunctionRenderEntries = this.viewList.renderEntries;
		this.viewListFunctionRenderEntry = this.viewList.renderEntry;

		// overwrite view list function
		this.viewList.render = this.render.bind(this);
		this.viewList.renderEntries = this.renderEntries.bind(this);
		this.viewList.renderEntry = this.renderEntry.bind(this);
	}

	// prototyping
	ViewListEndlessScroll.prototype = Object.create(Base.prototype,
	{
		/**
		 * holds all data which was not rendered and must be rendered later
		 *
		 * @var {Object}
		 */
		cachedEntries:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the count of rendered entries which was not visible
		 *
		 * @var {Number}
		 */
		countOfInvisbleEntries:
		{
			value: 0,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the number of inivisble entries, which should be rendered before rendering stops
		 *
		 * @var {Number}
		 */
		countOfPrerenderingEntries:
		{
			value: 3,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the number of invisible entries, by which the rendering of cached entries should starts
		 *
		 * @var {Number}
		 */
		countOfPrerenderingToTriggerRendering:
		{
			value: 3,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * this is the container, which scrolls
		 *
		 * @var {jQuery}
		 */
		elementScrollContainer:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the render position to which was rendered and to detect whether cached entries must be rendered or not
		 *
		 * @var {Number}
		 */
		lastRenderPosition:
		{
			value: 3,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * rendering is stopped or not
		 *
		 * @var {Boolean}
		 */
		renderingStopped:
		{
			value: false,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * defines the list or table which should have endless scrolling
		 *
		 * @var {ViewList}|{ViewTable}
		 */
		viewList:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * original view list function "render"
		 *
		 * @var {Function}
		 */
		viewListFunctionRender:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * original view list function "renderEntris"
		 *
		 * @var {Function}
		 */
		viewListFunctionRenderEntries:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		},

		/**
		 * original view list function "renderEntry"
		 *
		 * @var {Function}
		 */
		viewListFunctionRenderEntry:
		{
			value: null,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});

	/**
	 * clean up all data
	 *
	 * @returns {ViewListEndlessScroll}
	 */
	ViewListEndlessScroll.prototype.cleanup = function()
	{
		this.countOfInvisbleEntries = 0;
		this.renderingStopped = false;
		this.lastRenderPosition = null;
		this.cachedEntries = {};

		return this;
	};

	/**
	 * the event for scrolling
	 *
	 * @param {jQuery.Event} event
	 * @returns {ViewListEndlessScroll}
	 */
	ViewListEndlessScroll.prototype.onScroll = function(event)
	{
		// rendering was not stopped... do nothing
		if (this.renderingStopped !== true)
		{
			return this;
		}

		// the scroll position is on bottom. so add scrollTop and height of scrolling container
		var scrollPositionBottom = this.elementScrollContainer.scrollTop() + this.elementScrollContainer.height();

		// test if remembered scroll position is in view or was overscrolled.
		if (this.lastRenderPosition !== null && scrollPositionBottom > this.lastRenderPosition)
		{
			var entriesToRender = this.cachedEntries;

			// clean all cached information
			this.cleanup();

			// and render all entries
			lodash.each(entriesToRender, function(model, index)
			{
				this.viewList.renderEntry(model, index);
			}, this);
		}

		return this;
	};

	/**
	 * overwritten render function to bind events
	 *
	 * @returns {ViewList}
	 */
	ViewListEndlessScroll.prototype.render = function()
	{
		this.elementScrollContainer = null;

		return this.viewListFunctionRender.apply(this.viewList, arguments);
	};

	/**
	 * overwritten renderEntries function to cleanup cached data
	 *
	 * @returns {ViewList}
	 */
	ViewListEndlessScroll.prototype.renderEntries = function()
	{
		// clean all cached information
		this.cleanup();

		// find scroll container and bind scroll events
		if (this.elementScrollContainer === null || this.elementScrollContainer === undefined)
		{
			this.elementScrollContainer = this.viewList.$el.parents().filter(function()
			{
				return jQuery(this).css('overflow-y') !== 'visible';
			}).first();

			this.elementScrollContainer.scroll(this.onScroll.bind(this));
			elementWindow.resize(this.onScroll.bind(this));
		}

		return this.viewListFunctionRenderEntries.apply(this.viewList, arguments);
	};

	/**
	 * overwritten renderEntry function to handle rendering or not
	 *
	 * @param {Model} model
	 * @param {Number} index
	 * @returns {ViewList}
	 */
	ViewListEndlessScroll.prototype.renderEntry = function(model, index)
	{
		// rendering was stopped, cache data and do nothing
		if (this.renderingStopped === true)
		{
			this.cachedEntries[index] = model;

			return this.viewList;
		}

		// call original render
		this.viewListFunctionRenderEntry.apply(this.viewList, arguments);

		// get the view
		var viewEntry = this.viewList.getViewEntryByModel(model);

		// test if view is in browser visible in viewport
		if (elementInViewport(viewEntry.$el, true) === false)
		{
			// not visible... count invisible entries
			this.countOfInvisbleEntries++;

			// store current "invisible position" to trigger the rendering of cached entries
			if (this.countOfInvisbleEntries === this.countOfPrerenderingToTriggerRendering)
			{
				this.lastRenderPosition = this.elementScrollContainer.scrollTop() + this.elementScrollContainer.height();
			}

			// rendering limit of invisible entries was reached... stop rendering
			if (this.countOfInvisbleEntries >= this.countOfPrerenderingEntries)
			{
				this.renderingStopped = true;
				console.debug('Stop rendering for viewList ' + this.viewList.cid + ' at index ' + index + '/' + this.viewList.collection.length + ' for endless scrolling.');
			}
		}

		return this.viewList;
	};

	return ViewListEndlessScroll;
});
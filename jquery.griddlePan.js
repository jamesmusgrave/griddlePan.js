/*
 * jQuery griddlePan v1.0.0
 *
 * Licensed under the MIT license.
 * Copyright 2015 James Musgrave
 
 * https://github.com/jamesmusgrave/griddlePan.js
 */

/*jshint browser: true, curly: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */

(function(window, $) {

	'use strict';

	$.griddlePan = function(options, element) {
		this.element = $(element);
		this._create(options);
	};

	$.griddlePan.defaults = {
		
	};

	$.griddlePan.prototype = {
		/*
		 * Lets go
		 */
		_create: function(options) {
			this.options = $.extend(true, {}, $.griddle.defaults, options);

			var instance = this;

			setTimeout(function() {
				instance.element.addClass('griddlepan');
			}, 0);

			if (this.options.isResizable) {
				$(window).bind('smartresize.griddlePan', function() {
					instance._resize();
				});
			}

			this._init();
		},

		/*
		 * Set options after initialization using
		 * $.griddlePan('option',{ foo: bar});
		 */
		option: function(option) {
			if ($.isPlainObject(option)) {
				this.options = $.extend(true, this.options, option);
			}
		},

		/*
		 * Primary functions
		 */
		before: function() {
			if (this.options.before) {
				this.options.before(this.element);
			}
		},
		end: function() {
			if (this.options.end) {
				this.options.end(this.element);
			}
		},
		_init: function(){
			this._resize();
			this.offset = 0;
			this.runningOffset = 0;
			this.speed = this.cw*0.5;
			// this.speed = 150;
			this.minSpeed = this.cw*0.05;
			this.moveable = this.element.find('.template-items')[0];
			this._render();
			this.element.on("mousemove", this._mouseMove.bind(this));
		},
		_resize: function() {

			this.cx = this.element.offset().left;
			this.cw = this.element.width();
			this.iw = this.element.find('.template-items').width();

		},
		_mouseMove: function(e){

			this._resize();

			var x = e.clientX - this.cx;

			x = (x < 0)? 0 : x;
			x = (x > this.cw)? this.cw : x;

			var f = x/this.cw;

			var offset = (this.iw - this.cw) * f;

			// offset = (offset > this.w - this.cw)? this.iw - this.cw : offset;

			// offset = (offset < 0)? 0 : 0 - offset;

			this.offset = 0 - offset;

		},
		_render: function() {
			this.speed -= 2;
			this.speed = (this.speed< this.minSpeed)? this.minSpeed : this.speed;
			var diff = (this.runningOffset - this.offset)/this.speed;
			this.runningOffset -= diff;
			this.moveable.style.webkitTransform = 'translate3D('+this.runningOffset+'px,0px,0px)';
		  	requestAnimationFrame(this._render.bind(this));
		},
		_cancel: function() {
			this.element.children().attr('style','');
		}
	};

	var logError = function(message) {
		if (window.console) {
			window.console.error(message);
		}
	};


	/*
	 * plugin bridge
	 * leverages data method to either create or return $.griddle constructor
	 *
	 * lifted from jQuery Masonry
	 * http://masonry.desandro.com
	 *
	 * Copyright 2012 David DeSandro
	 * Licensed under the MIT license.
	 *
	 * original references: jQuery UI and jcarousel
	 * https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
	 * https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js
	 */

	$.fn.griddlePan = function(options) {
		if (typeof options === 'string') {
			// call method
			var args = Array.prototype.slice.call(arguments, 1);

			this.each(function() {
				var instance = $.data(this, 'griddle');
				if (!instance) {
					logError("cannot call methods on griddle pan prior to initialization; " +
						"attempted to call method '" + options + "'");
					return;
				}
				if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
					logError("no such method '" + options + "' for griddle pan instance");
					return;
				}
				// apply method
				instance[options].apply(instance, args);
			});
		} else {
			this.each(function() {
				var instance = $.data(this, 'griddlePan');
				if (instance) {
					// apply options & init
					instance.option(options || {});
					instance._init();
				} else {
					// initialize new instance
					$.data(this, 'griddlePan', new $.griddlePan(options, this));
				}
			});
		}
		return this;
	};


	/*
	 * smartresize: debounced resize event for jQuery
	 *
	 * latest version and complete README available on Github:
	 * https://github.com/louisremi/jquery.smartresize.js
	 *
	 * Copyright 2011 @louis_remi
	 * Licensed under the MIT license.
	 */

	var $event = $.event,
		resizeTimeout;

	$event.special.smartresize = {
		setup: function() {
			$(this).bind("resize", $event.special.smartresize.handler);
		},
		teardown: function() {
			$(this).unbind("resize", $event.special.smartresize.handler);
		},
		handler: function(event, execAsap) {
			// Save the context
			var context = this,
				args = arguments;

			// set correct event type
			event.type = "smartresize";

			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}
			resizeTimeout = setTimeout(function() {
				$event.dispatch.apply(context, args);

			}, execAsap === "execAsap" ? 0 : 100);
		}
	};

	$.fn.smartresize = function(fn) {
		return fn ? this.bind("smartresize", fn) : this.trigger("smartresize", ["execAsap"]);
	};

	/*!
	 * jQuery imagesLoaded plugin v1.1.0
	 * http://github.com/desandro/imagesloaded
	 *
	 * MIT License. by Paul Irish et al.
	 */

	$.fn.imagesLoaded = function(callback) {
		var $this = this,
			$images = $this.find('img').add($this.filter('img')),
			len = $images.length,
			blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
			loaded = [];

		function triggerCallback() {
			callback.call($this, $images);
		}

		function imgLoaded(event) {
			var img = event.target;
			if (img.src !== blank && $.inArray(img, loaded) === -1) {
				loaded.push(img);
				if (--len <= 0) {
					setTimeout(triggerCallback);
					$images.unbind('.imagesLoaded', imgLoaded);
				}
			}
		}

		// if no images, trigger immediately
		if (!len) {
			triggerCallback();
		}

		$images.bind('load.imagesLoaded error.imagesLoaded', imgLoaded).each(function() {
			// cached images don't fire load sometimes, so we reset src.
			var src = this.src;
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			// data uri bypasses webkit log warning (thx doug jones)
			this.src = blank;
			this.src = src;
		});

		return $this;
	};

})(window, jQuery);
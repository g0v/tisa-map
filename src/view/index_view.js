define([
	'jquery',
	'underscore',
	'backbone',
	'jquery.countdown',
	'scrollTop'

	], function($, _, Backbone) {

		var index = Backbone.View.extend({

			el: 'body',

			events: {
				"click #scroll-down": "scrollDown"
			},

			scrollDown: function() {
				$("html, body").animate({ scrollTop: $(window).height() }, 1000);
			}

		});

		return index;



})
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

			initialize: function() {

				// scroll down position
			    $('#scroll-down').css('left', ($(window).width() / 2) - 200 + 'px')

			    // scroll top position
			    $('#scroll-top').css('left', ($(window).width() / 2) - 200 + 'px')
			},

			scrollDown: function() {
				$("html, body").animate({ scrollTop: $(window).height() }, 1000);
			}

		});

		return index;



})
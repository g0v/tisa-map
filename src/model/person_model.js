define([
	'jquery',
	'underscore',
	'backbone'
	], function($, _, Backbone) {

		var lyModel = Backbone.Model.extend({

			defaults: {
				ly_arr: '',
				tisa_person: '',
			},

			initialize: function() {
				console.log('here in person model')
			}

		});

		return lyModel;
})
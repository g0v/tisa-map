define([
	'jquery',
	'underscore',
	'backbone'
	], function($, _, Backbone) {

		var locateModel = Backbone.Model.extend({

			defaults: {
				latlng: null
			}
		});

		return locateModel;
	})
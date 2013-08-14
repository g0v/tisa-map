define([
	'jquery',
	'underscore',
	'backbone',
	'model/ly_model',
	'collection/ly_collection'
	], function($, _, Backbone, lyModel, lysCollection) {

		var lyPerson = Backbone.ajax({
			dataType: 'json',
			url: '../json_data/mly-8.json',
			data: '',
			success: function(val) {
				_.each(val, function(data) {
					var ly = new lyModel();
					ly.set(data)
					lysCollection.push(ly)
				})
			}

		})

		return lyPerson;
	})
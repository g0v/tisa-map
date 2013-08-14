define([
	'jquery',
	'underscore',
	'backbone',
	'collection/ly_collection'
	], function($, _, Backbone, lyCollection) {

		var lyPerson = Backbone.ajax({
			dataType: 'json',
			url: '../json_data/mly-8.json',
			data: '',
			success: function(val) {
				console.log(val);
				_.each(val, function(data) {
					console.log(data);
				})
				// lyCollection.add(val);
			}

		})

		return lyPerson;
	})
define([
	'jquery',
	'underscore',
	'backbone',
	'model/ly_model'
	], function($, _, Backbone, lyModel) {

		var lyPerson = Backbone.ajax({
			dataType: 'json',
			url: '../json_data/mly-8.json',
			data: '',
			success: function(val) {
				console.log(val);
				_.each(val, function(data) {
					var ly = new lyModel(data);
				})
				// lyCollection.add(val);
			}

		})

		return lyPerson;
	})
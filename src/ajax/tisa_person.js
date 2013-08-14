define([
	'jquery',
	'underscore',
	'backbone',
	'model/person_model'
	], function($, _, Backbone, personModel) {

		var tisa_person = Backbone.ajax({
			dataType: 'json',
			url: '../json_data/tisa-person.json',
			data: '',
			success: function(val) {
				console.log(val);
				_.each(val, function(data) {
					var ly = new personModel(data);
				})
				// lyCollection.add(val);
			}

		})

		return tisa_person;
	})
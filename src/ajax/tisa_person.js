define([
	'jquery',
	'underscore',
	'backbone',
	'model/person_model',
	'collection/person_collection'
	], function($, _, Backbone, personModel, personCollection) {

		var tisa_person = Backbone.ajax({
			dataType: 'json',
			url: '../json_data/tisa-person.json',
			data: '',
			success: function(val) {
				console.log(val);
				_.each(val, function(data) {
					var ly = new personModel();
					console.log(ly);
					console.log(data);
					// ly.set(data);

					personCollection.push(ly)
				})
				// lyCollection.add(val);
			}

		})

		return tisa_person;
	})
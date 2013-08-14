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
				var person = new personModel();
				person.set(val);
				personCollection.push(person);
				//personCollection.set('tisa-person', val)
				// _.each(val, function(data) {
				// 	console.log(data);
				// 	var ly = new personModel();
				// 	// ly.set(data);
				// 	personCollection.push(ly)
				// })
				// lyCollection.add(val);
			}

		})

		return tisa_person;
	})
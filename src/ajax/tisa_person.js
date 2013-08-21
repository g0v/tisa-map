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
			}

		})

		return tisa_person;
	})
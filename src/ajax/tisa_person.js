define([
	'jquery',
	'underscore',
	'backbone',
	'collection/ly_collection'
	], function($, _, Backbone, lyCollection) {

		var tisa_person = Backbone.ajax({
			dataType: 'json',
			url: '../json_data/tisa-person.json',
			data: '',
			success: function(val) {
				console.log(val);
				lyCollection.add(val);
				console.log(val);
			}

		})

		return tisa_person;
	})
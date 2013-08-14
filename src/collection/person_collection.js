define([
	'jquery',
	'underscore',
	'backbone',
	'model/person_model'
	], function($, _, Backbone, personModel) {

	var lysCollection = Backbone.Collection.extend({

			model: personModel
	});

	return new lysCollection();

});
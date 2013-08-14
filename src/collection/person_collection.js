define([
	'jquery',
	'underscore',
	'backbone',
	'model/person_model'
	], function($, _, Backbone, personModel) {

	var lysCollection = Backbone.Collection.extend({

			model: personModel,

			initialize: function () {
				console.log('collection init');
			},

	});

	return new lysCollection();

});
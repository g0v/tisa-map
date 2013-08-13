define([
	'jquery',
	'underscore',
	'backbone',
	'model/ly_model'
	], function($, _, Backbone, lyModel) {

	var lysCollection = Backbone.Collection.extend({

			model: lyModel,


	});

	return lysCollection;

});
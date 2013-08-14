define([
	'jquery',
	'underscore',
	'backbone',
	'model/ly_model'
	], function($, _, Backbone, lyModel) {

	var lysCollection = Backbone.Collection.extend({

			model: lyModel,

			initialize: function () {
				console.log('collection init');
			}


	});

	return new lysCollection();

});
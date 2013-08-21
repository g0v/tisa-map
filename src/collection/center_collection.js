define([
	'jquery',
	'underscore',
	'backbone',
	'model/center_model'
	], function($, _, Backbone, CenterModel) {

		var centerCollection = Backbone.Collection.extend({

			model: CenterModel,

			
		});

		return centerCollection;
	})
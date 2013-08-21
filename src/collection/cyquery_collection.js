define([
	'jquery',
	'underscore',
	'backbone',
	'model/cyquery_model'
	], function($, _, Backbone, Cquery) {

		var cyqueryCollection = Backbone.Collection.extend({

			model: Cquery,

			
		});

		return cyqueryCollection;
	})
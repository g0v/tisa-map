define([

	'jquery',
	'underscore',
	'backbone',
	'firebase'

	], function($, _, Backbone) {
		var memberModel = Backbone.Model.extend({
			
			defaults: {
				user: null
			}

		});

		return memberModel;
	})
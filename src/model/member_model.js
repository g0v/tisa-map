define([

	'jquery',
	'underscore',
	'backbone',
	'firebase',
	'avatars'

	], function($, _, Backbone) {
		var memberModel = Backbone.Model.extend({
			
			defaults: {
				user: null
			}

		});

		return memberModel;
	})
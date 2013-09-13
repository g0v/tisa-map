define([

	'jquery',
	'underscore',
	'backbone'

	], function($, _, Backbone) {

		var authModel = Backbone.Model.extend({

			defaults: {
				db: null,
				user: null,
				auth: false,
				user_update: false,
				upload_img: false,
				upload_path: null
			}


		});

	return authModel;

	
});
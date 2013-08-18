define([
	'jquery',
	'underscore',
	'backbone',
	'model/fire_model',
	'firebase'
	], function($, _, Backbone, fireModel) {
		var firebaseDB = Backbone.Collection.extend({

			model: fireModel,

			login: function () {
				var tisadb = new Firebase('https://tisa.firebaseIO.com');
		       	tisadb.auth('EymO4wmkV7dJBZgZq4sRo8lXAItLAJKHjaOWPShU', function(error, result) {
		            if(error) {
		                // create firebase reference error
		                console.log("Login Failed!", error);
		            } else {
		                // successfully create firebase reference
		                console.log('Authenticated successfully with payload:', result.auth);
		                console.log('Auth expires at:', new Date(result.expires * 1000));
		            }
		        });

		       	return tisadb;

			}
		});

		return firebaseDB;
		
	})
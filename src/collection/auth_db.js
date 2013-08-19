define([

	'jquery',
	'underscore',
	'backbone',
	'collection/firebase_db',
	'model/auth_model',
	'view/auth_view',
	'firebase',
	'firebase_login',

	], function($, _, Backbone, firebaseCollection, AuthModel, AuthView) {

		var authDB = Backbone.Collection.extend({

			model: AuthModel,

			authUser: function () {
				var firebase = new firebaseCollection();
				var tisadb = firebase.login();
				var authModel = new AuthModel();

				this.authModel = authModel
				this.add(authModel);
				authModel.set({ db : tisadb});

				var _this = this;

				var auth = new FirebaseSimpleLogin(tisadb, function(error, user) {

					if (error) {
						// an error occurred while attempting login
						console.log(error);
					} else if (user) {
						authModel.set({user: user});
						authModel.set({auth: true});
						_this.userLogin(authModel);
					} else {
						authModel.set({auth: false});
					}
				});

				return auth;
			},

			returnAuth: function () {
				return this.authModel.get('auth');
			},

			returnDB: function () {
				return this.authModel.get('db');
			},

			returnUser: function () {
				return this.authModel.get('user');
			},

			returnImgPath: function () {
				return this.authModel.get('upload_path');
			},

			userLogin: function (authModel) {

				var tisadb = authModel.get('db');
				var user = authModel.get('user');
				// enter to 'users' child
				var userRef = tisadb.child('users');
				// enter to individual users
				var peopleRef = userRef.child(user.id + '(' +  user.provider + ')');
				// setup some variables before updating to database
				var email = user.email || ''
				, provider = user.provider || ''
				, id = user.id || ''
				, displayName = user.displayName || ''
				, username = user.username || ''
				, latlng = [];

				// make latitude, longtitude array

				// update data to database
				peopleRef.update({
					username: username,
					displayName: displayName,
					id: id,
					provider: provider,
					email: email,
					avatar: "http://avatars.io/" + provider + '/' + username + "?size=medium",
					latlng: latlng
				})

				// appear user picture.
				
				authModel.set({ user_update: true});

				// upload participate image, if the image exist then update.
				if(peopleRef.child('upload_img')) {
					peopleRef.child('upload_img').on('value', function(snapshot){

						authModel.set({ upload_img: true, upload_path: snapshot.val()})

					})
				}
   
			}


		});

	return authDB;

	
});
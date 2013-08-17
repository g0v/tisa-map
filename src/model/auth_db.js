define([

	'jquery',
	'underscore',
	'backbone',
	'model/firebase_db',
	'firebase',
	'firebase_login',

	], function($, _, Backbone, firebaseModel) {

		var authDB = Backbone.Model.extend({

			defaults: {
				db: null,
				user: null,
				auth: false
			},

			authUser: function () {
				var firebase = new firebaseModel();
				var tisadb = firebase.login();
				var _this = this;

				_this.set({ db : tisadb})

				var auth = new FirebaseSimpleLogin(tisadb, function(error, user) {

					if (error) {
						// an error occurred while attempting login
						console.log(error);
					} else if (user) {
						_this.set({user: user});
						_this.set({auth: true});
						_this.userLogin();
					} else {
						_this.set({auth: false});
					}
				});

				return auth;
			},

			userLogin: function () {

				var _this = this;
				var tisadb = _this.get('db');
				var user = _this.get('user');
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

				// display social network thumb while user login successfully
				$('#login_img').html('<img src="http://avatars.io/' + user.provider + '/' + user.username + '/?size=medium"/>' );


				// upload participate image, if the image exist then update.
				if(peopleRef.child('upload_img')) {
					peopleRef.child('upload_img').on('value', function(snapshot){

						$('#upload_process').html('<img src="' + snapshot.val() + '" width=100px/> 感謝你的參與～～你可以再重新上傳，我們只會使用你最新上傳的照片' );

					})
				}
   
			}


		});

	return authDB;

	
});
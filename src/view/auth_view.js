define([

	'jquery',
	'underscore',
	'backbone',
	'model/auth_db',
	'firebase',
	'firebase_login',
	'avatars',

	], function($, _, Backbone, AuthDB) {
		var memberView = Backbone.View.extend({

			el: 'body',

			events: {
				"click #facebook_login": "facebookLogin",
				"click #twitter_login": "twitterLogin",
				"click #logout": "userLogout"
			},

			initialize: function () {
				var userAuth = new AuthDB();
				var auth = userAuth.authUser();
				this.userAuth = userAuth;
				this.auth = auth;
				this.listenTo(userAuth, 'change', this.userState)
			},

			facebookLogin: function () {
				this.auth.login('facebook', {
					rememberMe: true,
					scope: 'email,user_likes'
				});
			},

			twitterLogin: function () {
				this.auth.login('twitter', {
					rememberMe: true
				});
			},

			userLogout: function () {
				this.auth.logout();
			},

			userState: function () {
				if(this.userAuth.get('auth')) {
					$('#facebook_login').hide();
	                $('#twitter_login').hide();
	                $('#logout').show();
	                $('#login_area').show();
				}else {
					$('#facebook_login').show();
	                $('#twitter_login').show();
	                $('#logout').hide();
	                $('#login_area').hide();
				}
			}



		});

		return memberView;
	})
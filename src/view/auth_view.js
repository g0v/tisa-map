define([

	'jquery',
	'underscore',
	'backbone',
	'collection/auth_db',
	'collection/avatar_collection',
	'firebase',
	'firebase_login',
	'avatars',

	], function($, _, Backbone, AuthDB, AvatarCollection) {
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
				this.userState();
				this.listenTo(userAuth, 'change', this.userState);
				this.listenTo(userAuth, 'change:user_update', this.userPic)
				this.listenTo(userAuth, 'change:upload_img', this.uploadImg)

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
				if(this.userAuth.returnAuth()) {
					$('#facebook_login').hide();
	                $('#twitter_login').hide();
	                $('#logout').show();
	                $('#login_area').show();
	                var avatars = new AvatarCollection();
	                avatars.allowPic(this.userAuth.returnDB)
				}else {
					$('#facebook_login').show();
	                $('#twitter_login').show();
	                $('#logout').hide();
	                $('#login_area').hide();

				}
			},

			userPic: function () {
				var user = this.userAuth.returnUser();
				$('#login_img').html('<img src="http://avatars.io/' + user.provider + '/' + user.username + '/?size=medium"/>' );

			},

			uploadImg: function () {
				var path = this.userAuth.returnImgPath();
				$('#upload_process').html('<img src="' + path + '" width=100px/> 感謝你的參與～～你可以再重新上傳，我們只會使用你最新上傳的照片' );

			}



		});

		return memberView;
	})
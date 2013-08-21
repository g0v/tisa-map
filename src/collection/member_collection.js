define([

	'jquery',
	'underscore',
	'backbone',
	'model/member_model',
	'firebase',
	'avatars'

	], function($, _, Backbone, MemberModel) {
		var memberCollection = Backbone.Collection.extend({

			model: MemberModel,
			
			addMember: function (members) {
				var userRef = new Firebase('https://tisa.firebaseIO.com/users');
				// private
				var _this = this;

				// show up the people that have already login.
				userRef.on('child_added', function(snapshot) {
					_this.add({user: snapshot.val()})
				});
			}
			


		});

		return memberCollection;
	})
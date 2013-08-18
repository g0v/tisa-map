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
			
			addMember: function () {
				var userRef = new Firebase('https://tisa.firebaseIO.com/users');

				// all person's data to an array
            	var peopleArr = [];

            	// private
            	var _this = this;

				// show up the people that have already login.
	            userRef.on('child_added', function(snapshot) {
	            	var memberModel = new MemberModel();
	            	memberModel.set({user: snapshot.val()})
	            	_this.push(memberModel);
	            });

			}
            


		});

		return memberCollection;
	})
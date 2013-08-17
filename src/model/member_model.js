define([

	'jquery',
	'underscore',
	'backbone',
	'firebase',
	'avatars'

	], function($, _, Backbone) {
		var memberModel = Backbone.View.extend({
			
			addMember: function () {
				var userRef = new Firebase('https://tisa.firebaseIO.com/users');

				// all person's data to an array
            	var peopleArr = [];
				// show up the people that have already login.
	            userRef.on('child_added', function(snapshot) {

	                // fetch personal data from firebase
	                var personData = snapshot.val()
	                , personArr = [];

	                $('#login_list').append('<img src="' + personData.avatar + '" width="50"/>');

	                personArr.push(personData.latlng[0]);
	                personArr.push(personData.latlng[1]);
	                personArr.push(personData.avatar);
	                personArr.push(personData.displayName);

	                // push person data to people array

	                peopleArr.push(personArr)

	                return peopleArr;
	            });
			}
            


		});

		return memberModel;
	})
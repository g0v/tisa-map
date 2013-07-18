$(document).ready(function() {

		var tisadb = new Firebase('https://tisa.firebaseIO.com');

		tisadb.auth('EymO4wmkV7dJBZgZq4sRo8lXAItLAJKHjaOWPShU', function(error, result) {
			if(error) {
				console.log("Login Failed!", error);
			} else {
				console.log('Authenticated successfully with payload:', result.auth);
				console.log('Auth expires at:', new Date(result.expires * 1000));
			}
		});

		var auth = new FirebaseSimpleLogin(tisadb, function(error, user) {
		  	  if (error) {
			    // an error occurred while attempting login
			    console.log(error);
			  } else if (user) {
			    // user authenticated with Firebase
			    $('#facebook_img').append('<img src="http://avatars.io/' + user.provider + '/' + user.id + '"/>' )
			    console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
				$('#facebook_login').hide();
				$('#facebook_logout').show();

			  } else {
			    // user is logged out
			    $('#facebook_login').show();
				$('#facebook_logout').hide();
			  }
		});

		

		$('#facebook_login').click(function() {

			console.log('facebook login onclick')
			auth.login('facebook', {
			  rememberMe: true,
			  scope: 'email,user_likes'
			});
			
		})

		$('#facebook_logout').click(function() {
			console.log('facebook is logout');
			auth.logout();
		})

	})
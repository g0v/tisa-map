$(document).ready(function() {

		$('#facebook_login').click(function() {

			console.log('facebook login onclick')
			auth.login('facebook', {
				rememberMe: true,
				scope: 'email,user_likes'
			});
			console.log(auth);
		})

		$('#twitter_login').click(function() {

			console.log('twitter login onclick')
			auth.login('twitter', {
				rememberMe: true
			});
		})

		$('#logout').click(function() {
			console.log('logout');
			auth.logout();
		})

	})
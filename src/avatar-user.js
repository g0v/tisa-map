var client = new AvatarsIO('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwcml2YXRlX3Rva2VuIjoiZjlmMGVmNjgxOWRjNjQ2ODM2ZGQxNzgzZWJhNmJhZTBkOGRkN2ZmMDI4MjkwZGM1NDEyN2ZmNGQ2ODQzMWFjNiJ9.IULO-Hzyzmrns41MV9EDf_mTuzQIx0qSYzDzk62l6zM'); // obtain at http://avatars.io/

$(function(){
    var uploader = client.create('#avatar'); // selector for input[type="file"] field, here #avatar, for example
    uploader.setAllowedExtensions(['png', 'jpg']); // optional, defaults to png, gif, jpg, jpeg
	uploader.on('start', function(){
	    // fires when new avatar starts uploading
	    $('#upload_process').html('<img src="./img/ajax-loader.gif"/>')
	});

	uploader.on('complete', function(url){
		$('#upload_process').html('<img src="' + url + '?size=medium" width="150px"/>感謝你的參與！！')
		$('#avatar').hide();
	});
});
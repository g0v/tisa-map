define([
	'jquery',
	'underscore',
	'backbone'
	], function($, _, Backbone) {

		var locateView = Backbone.View.extend({

			initialize: function() {
				this.startLocate();
			},

			startLocate: function() {
				if (navigator.geolocation) {
    
			        navigator.geolocation.getCurrentPosition(function(option) {
			            field.setValue(option.coords.latitude, option.coords.longitude)
			        }, function(error) {
			            switch (error.code) {
			                case error.TIMEOUT:
			                    alert('GPS 定位連線逾時，請手動輸入所在地');
			                    break;
			     
			                case error.POSITION_UNAVAILABLE:
			                    alert('無法取得 GPS 定位，請手動輸入所在地');
			                    break;
			     
			                case error.PERMISSION_DENIED://拒絕
			                    //alert('不允許 GPS 自動定位，請手動輸入所在地');
			                    break;
			     
			                case error.UNKNOWN_ERROR:
			                    alert('不明的錯誤，請手動輸入所在地');
			                    break;
			            }
			        })

			    } else { // 不支援 HTML5 定位

			        // 若支援 Google Gears
			        if (window.google && google.gears) {
			            try {
			                  // 嘗試以 Gears 取得定位
			                  var geo = google.gears.factory.create('beta.geolocation');
			                  geo.getCurrentPosition(successCallback, errorCallback, { enableHighAccuracy: true,gearsRequestAddress: true });
			            } catch(e){
			                  alert("定位失敗，請手動輸入所在地");
			            }
			        }else{
			            alert("不允許 GPS 自動定位，請手動輸入所在地");
			        }

			        function errorCallback(err) {
			            var msg = '自動定位有誤，請手動輸入所在地<br>錯誤訊息：' + err.message;
			            alert(msg);
			        }
			         
			        // 成功取得 Gears 定位
			        function successCallback(option) {
			              field.setValue(option.coords.latitude, option.coords.longitude);
			        }



			    }

			    function field(){
				    var latitude 
				    var longitude 
				   
				    this.getValue = function(){
				        console.log(latitude)
				        console.log(longitude)
				        return [latitude, longitude];
				    };
				   
				    this.setValue = function(lat_val, long_val){
				        latitude = lat_val;
				        longitude = long_val;
				        $('#usr_lat').val(lat_val)
				        $('#usr_lng').val(long_val)
				        console.log($('#usr_lat').val());
				        console.log($('#usr_lng').val());
				        createMap (this.getValue())
				    };
				}
			},

		});

		return locateView;
	})
define([
	'jquery',
	'underscore',
	'backbone',
	'model/locate_model'
	], function($, _, Backbone, LocateModel) {

		var locateCollection = Backbone.Collection.extend({

			model: LocateModel,

			startLocate: function() {
				if (navigator.geolocation) {
					var _this = this;

			        navigator.geolocation.getCurrentPosition(function(option) {
			            var locateModel = new LocateModel();
			            locateModel.set({latlng: option})
			            _this.push(locateModel);
			        }, function(error) {
			            switch (error.code) {
			                case error.TIMEOUT:
			                    alert('GPS 定位連線逾時，請手動輸入所在地');
			                    break;
			 
			                case error.POSITION_UNAVAILABLE:
			                    alert('無法取得 GPS 定位，請手動輸入所在地');
			                    break;
			 
			                case error.PERMISSION_DENIED://拒絕
			                    alert('不允許 GPS 自動定位，請手動輸入所在地');
			                    break;
			 
			                case error.UNKNOWN_ERROR:
			                    alert('不明的錯誤，請手動輸入所在地');
			                    break;
			            }
			        })

			    } 
			}
		});

		return locateCollection;
	})
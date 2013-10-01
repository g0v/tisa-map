App.Collection.Location = Backbone.Collection.extend({
    model: App.Model.Location,
    startLocate: function() {
        if (navigator.geolocation) {
            var that = this;
            navigator.geolocation.getCurrentPosition(
                function(option) {
                    that.add({latlng: option});
                },
                function(error) {
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
                }
            );
        }
    }
});


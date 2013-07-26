var geocoder;
var field = new Field();

// count down javascript code

$(function(){

    // 第一個倒數計時, 圖片來源為 images/digits.png
    // 倒數時間為 1 天 12 小時又 12 分 0 秒
    $('#counter').countdown({
        image: 'img/digits.png',
        startTime: '01:12:12:00'
    });
});

// get person from json and convert to html

get_person(function() {

    var source   = $("#entry-template").html();
    var template = Handlebars.compile(source);
    for (var i = ly_arr.length - 1; i >= 0; i--) {
        if(ly_arr[i].party  === 'KMT') {
            ly_arr[i].party = '國民黨';
        }

        var html    = template(ly_arr[i]);
        $('#gov-area').append(html)
    };
    
});


// some initialize code for the map, scroll, geocode...

function initialize () {

    // scroll down position

    $('#scroll-down').css('left', ($(window).width() / 2) - 200 + 'px')

    // scroll top position

    $('#scroll-top').css('left', ($(window).width() / 2) - 200 + 'px')

    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    });

    geocoder = new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.OpenStreetMap()
    }).addTo(map);

    L.tileLayer('http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png', {
    maxZoom: 18,
    }).addTo(map);

    var town_layer = L.geoJson(null, {
        style: {
            color: 'red',
            weight: 5,
            fill: 'red',
            opacity: 1,
            fillOpacity: 0.3
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<img src='" + feature.properties.avatar + "'/><br/>" + feature.properties.name + "<br/><a href='#" + feature.properties.name + "'>我要找他求救！</a>");
        }
    });

    $.getJSON('./json_data/tisa-ly-map.json', function (data) {
        var town_geojson = topojson.feature(data, data.objects["twVote1982.geo"]);
        town_layer.addData(town_geojson);
    });

    // set initial map view

    map.setView(['24', '121'], 7).addLayer(town_layer);

    map.addControl(new L.Control.Zoom({ position: 'bottomleft' }));


}

// locating user's location

function startLocate() {
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
     
}


// create mark to the map, pointing out where the user is.

function createMap (setplace) {
    map.setView(setplace, 13);


    L.marker(setplace).addTo(map)
    .bindPopup("<b>你現在在這！</b>").openPopup();

    
}



function Field(){
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

initialize();
startLocate();

// scroll down click button

$('#scroll-down').click(function() {
    $("html, body").animate({ scrollTop: $(window).height() }, 1000);
});
require.config({
    baseUrl: '/',
    paths: {
        'jquery'            : '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
        'underscore'        : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min',
        'backbone'          : '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
        'firebase'          : '//cdn.firebase.com/v0/firebase',
        'firebase_login'    : '//cdn.firebase.com/v0/firebase-simple-login',
        'leaflet'           : '//cdn.leafletjs.com/leaflet-0.6.2/leaflet',
        'application'       : '/assets/application',
    },
   shim: {
      'underscore': {
        exports: '_'
      },

      'backbone': {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
      },

      'firebase_login': {
        deps: ['firebase']
      },

      'leaflet': {
        deps: ['jquery']
      },

      'application': {
        deps: ['jquery', 'leaflet']
      },
   }
});

require([
'jquery',
'underscore',
'backbone',
'leaflet',
'application',
], function($, _, Backbone){
    'use strict';
App.Model.Center = Backbone.Model.extend({
});
App.Collection.Center = Backbone.Collection.extend({
    model: App.Model.Center,
});
App.Model.Company = Backbone.Model.extend({
});
App.Collection.Company = Backbone.Collection.extend({
    model: App.Model.Company,
});

var CompanyView = Backbone.View.extend({
    el: 'body',
    initialize: function (options) {
        this.map = options.map;
        this.centers = new App.Collection.Center();
        this.companys = new App.Collection.Company();
        this.map.on('drag', function(e) {
                this.centers.add({center: this.map.getCenter()})
        }, this);
        this.listenTo(this.centers, 'add', this.addCenter);
        this.listenTo(this.companys, 'add', this.addCompany);
    },
    addlocateCenter: function (data) {
        var lat = data.center.lat;
        var lng = data.center.lng;
        this.companys.url = '/lng/' + lng + '/lat/' + lat + '/radius/500';
        this.companys.fetch();
    },
    addCenter: function () {
        var center = this.centers.pop();
        var lat = center.attributes.center.lat;
        var lng = center.attributes.center.lng;
        this.companys.url = '/lng/' + lng + '/lat/' + lat + '/radius/100';
        this.companys.fetch();
    },
    addCompany: function () {
        var company = this.companys.pop().attributes;
        var company_name = company.name;
        var company_taxid = company.taxid;
        var company_lng = company.geography.coordinates[0];
        var company_lat = company.geography.coordinates[1];
        var marker = L.marker(L.latLng(company_lat, company_lng), { title: company_name });
        // add popup
        marker.bindPopup(company_name + ' (' + company_taxid + ' )');
        this.map.addLayer(marker);
    }
});

var LocateModel = Backbone.Model.extend({
    defaults: {
        latlng: null
    }
});
var LocateCollection = Backbone.Collection.extend({
    model: LocateModel,
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

var MapView = Backbone.View.extend({
    initialize: function  () {
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        });

        this.location = new LocateCollection();
        this._company_view = new CompanyView({ map: this.map });

        this.listenTo(this.location, 'add', this.userLocation)
        this.location.startLocate();

        new L.Control.GeoSearch({
            provider: new L.GeoSearch.Provider.OpenStreetMap()
        }).addTo(this.map);

        L.tileLayer(
            'http://{s}.tile.cloudmade.com/f59941c17eda4947ae395e907fe531a3/997/256/{z}/{x}/{y}.png',
            { maxZoom: 18, }
        ).addTo(this.map);

        this.map.addControl(new L.Control.Zoom({ position: 'bottomleft' }));
    },
    userLocation: function () {
            var option = this.location.pop().attributes.latlng;
            var setplace = [option.coords.latitude, option.coords.longitude];
            this.map.setView(setplace, 13);
            L.marker(setplace).addTo(this.map).bindPopup("<b>你現在在這！</b>").openPopup();
            this._company_view.addlocateCenter({center: {lat: option.coords.latitude, lng: option.coords.longitude}})
    },
});

new MapView();

})

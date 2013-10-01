//= require app
//= require_tree ./app/model
//= require_tree ./app/collection
//= require_tree .

App.View.Company = Backbone.View.extend({
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

App.View.Map = Backbone.View.extend({
    initialize: function  () {
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        });

        this.location = new App.Collection.Location();
        this._company_view = new App.View.Company({ map: this.map });

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

$(document).ready(function() {
    new App.View.Map();
});
